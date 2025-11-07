import type { ConsoleActor, SatelliteActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { ECDSAKeyIdentity, Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { mockClientId } from '../mocks/jwt.mocks';
import { generateNonce } from './auth-nonce-tests.utils';
import { makeMockGoogleOpenIdJwt } from './jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from './observatory-openid-tests.utils';
import { tick } from './pic-tests.utils';

export const testAuthRate = ({
	actor: getActor,
	pic: getPic,
	config
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	pic: () => PocketIc;
	config: (params: { max_tokens: bigint; time_per_token_ns: bigint }) => Promise<void>;
}) => {
	describe('Rate', async () => {
		let pic: PocketIc;

		let actor: Actor<SatelliteActor | ConsoleActor>;

		const user = Ed25519KeyIdentity.generate();

		const sessionKey = await ECDSAKeyIdentity.generate();
		const publicKey = new Uint8Array(sessionKey.getPublicKey().toDer());

		const { nonce, salt } = await generateNonce({ caller: user });

		beforeAll(() => {
			pic = getPic();
			actor = getActor();
		});

		const generateJwtCertificate = async ({
			advanceTime,
			refreshJwts = true,
			kid
		}: {
			advanceTime?: number;
			refreshJwts?: boolean;
			kid?: string;
		}): Promise<{ jwt: string }> => {
			await pic.advanceTime(advanceTime ?? 1000 * 60 * 15); // Observatory refresh every 15min
			await tick(pic);

			const now = await pic.getTime();

			const { jwks, jwt } = await makeMockGoogleOpenIdJwt({
				clientId: mockClientId,
				date: new Date(now),
				nonce,
				kid
			});

			if (!refreshJwts) {
				return { jwt };
			}

			// Refresh certificate in Observatory
			await assertOpenIdHttpsOutcalls({ pic, jwks });

			return { jwt };
		};

		it('should throw error if user rate is reached', async () => {
			actor.setIdentity(user);

			const { jwt } = await generateJwtCertificate({});

			const { authenticate } = actor;

			const result = await authenticate({
				OpenId: { jwt, session_key: publicKey, salt }
			});

			expect('Ok' in result).toBeTruthy();

			await config({
				max_tokens: 1n,
				time_per_token_ns: 2_000_000_000n // 2s
			});

			actor.setIdentity(user);

			const { jwt: jwt2 } = await generateJwtCertificate({ refreshJwts: false, advanceTime: 500 });

			const result2 = await authenticate({
				OpenId: { jwt: jwt2, session_key: publicKey, salt }
			});

			// The error in result2 does not matter much here.
			// Goal is to assert the rate limiter.
			if ('Ok' in result2) {
				expect(true).toBeFalsy();

				return;
			}

			const { Err } = result2;

			if (!('PrepareDelegation' in Err)) {
				expect(true).toBeFalsy();

				return;
			}

			const { PrepareDelegation } = Err;

			if (!('GetOrFetchJwks' in PrepareDelegation)) {
				expect(true).toBeFalsy();

				return;
			}

			const { jwt: jwt3 } = await generateJwtCertificate({ refreshJwts: false, advanceTime: 400 });

			await expect(
				authenticate({
					OpenId: { jwt: jwt3, session_key: publicKey, salt }
				})
			).rejects.toThrow('Rate limit reached, try again later.');
		});
	});
};
