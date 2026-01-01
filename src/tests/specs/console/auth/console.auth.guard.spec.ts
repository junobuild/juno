import type { ConsoleActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { ECDSAKeyIdentity, Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { ANONYMOUS_ERROR_MSG } from '../../../constants/console-tests.constants';
import { mockClientId } from '../../../mocks/jwt.mocks';
import { generateNonce } from '../../../utils/auth-nonce-tests.utils';
import { setupConsole } from '../../../utils/console-tests.utils';
import { makeMockGoogleOpenIdJwt } from '../../../utils/jwt-tests.utils';

describe('Console > Authentication > Guard', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	beforeAll(async () => {
		const { pic: p, actor: c } = await setupConsole({});

		pic = p;
		actor = c;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('Anonymous', async () => {
		const user = Ed25519KeyIdentity.generate();

		const mockExpiration = 30n * 60n * 1_000_000_000n; // 30min

		const { nonce, salt } = await generateNonce({ caller: user });

		const sessionKey = await ECDSAKeyIdentity.generate();
		const publicKey = new Uint8Array(sessionKey.getPublicKey().toDer());

		const generateJwt = async (): Promise<string> => {
			const now = await pic.getTime();
			const { jwt } = await makeMockGoogleOpenIdJwt({
				clientId: mockClientId,
				date: new Date(now),
				nonce
			});
			return jwt;
		};

		beforeEach(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		it('should throw error on authenticate', async () => {
			const { authenticate } = actor;

			await expect(
				authenticate({
					OpenId: {
						jwt: await generateJwt(),
						session_key: publicKey,
						salt
					}
				})
			).rejects.toThrowError(ANONYMOUS_ERROR_MSG);
		});

		it('should throw error on get_delegation', async () => {
			const { get_delegation } = actor;

			await expect(
				get_delegation({
					OpenId: {
						jwt: await generateJwt(),
						session_key: publicKey,
						salt,
						expiration: mockExpiration
					}
				})
			).rejects.toThrowError(ANONYMOUS_ERROR_MSG);
		});
	});
});
