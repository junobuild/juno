import type { SatelliteActor } from '$declarations';
import { ECDSAKeyIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish, fromNullable } from '@dfinity/utils';
import { mockClientId } from '../../../../mocks/jwt.mocks';
import { generateNonce } from '../../../../utils/auth-nonce-tests.utils';
import { makeMockGoogleOpenIdJwt } from '../../../../utils/jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from '../../../../utils/observatory-openid-tests.utils';
import { tick } from '../../../../utils/pic-tests.utils';
import { setupSatelliteAuth } from '../../../../utils/satellite-auth-tests.utils';

describe('Satellite > Auth > Rate', async () => {
	let pic: PocketIc;

	let satelliteActor: Actor<SatelliteActor>;

	let controller: Ed25519KeyIdentity;

	const user = Ed25519KeyIdentity.generate();

	const sessionKey = await ECDSAKeyIdentity.generate();
	const publicKey = new Uint8Array(sessionKey.getPublicKey().toDer());

	const { nonce, salt } = await generateNonce({ caller: user });

	beforeAll(async () => {
		const {
			pic: p,
			satellite: { actor },
			controller: c
		} = await setupSatelliteAuth();

		pic = p;
		satelliteActor = actor;

		controller = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const config = async ({
		max_tokens,
		time_per_token_ns
	}: {
		max_tokens: bigint;
		time_per_token_ns: bigint;
	}) => {
		satelliteActor.setIdentity(controller);

		const { get_rule, set_rule } = satelliteActor;

		const collectionType = { Db: null };
		const collection = '#user';

		const result = await get_rule(collectionType, collection);

		const rule = fromNullable(result);

		assertNonNullish(rule);

		await set_rule(collectionType, collection, {
			...rule,
			rate_config: [
				{
					max_tokens,
					time_per_token_ns
				}
			]
		});
	};

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
		satelliteActor.setIdentity(user);

		const { jwt } = await generateJwtCertificate({});

		const { authenticate_user } = satelliteActor;

		const result = await authenticate_user({
			OpenId: { jwt, session_key: publicKey, salt }
		});

		expect('Ok' in result).toBeTruthy();

		await config({
			max_tokens: 1n,
			time_per_token_ns: 2_000_000_000n // 2s
		});

		satelliteActor.setIdentity(user);

		const { jwt: jwt2 } = await generateJwtCertificate({ refreshJwts: false, advanceTime: 500 });

		const result2 = await authenticate_user({
			OpenId: { jwt: jwt2, session_key: publicKey, salt }
		});

		expect('Ok' in result2).toBeTruthy();

		const { jwt: jwt3 } = await generateJwtCertificate({ refreshJwts: false, advanceTime: 400 });

		await expect(
			authenticate_user({
				OpenId: { jwt: jwt3, session_key: publicKey, salt }
			})
		).rejects.toThrow('Rate limit reached, try again later.');
	});
});
