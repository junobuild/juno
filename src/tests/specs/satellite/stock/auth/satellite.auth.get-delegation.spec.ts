import {
	idlFactoryObservatory,
	type ObservatoryActor,
	type SatelliteActor,
	type SatelliteDid
} from '$declarations';
import { ECDSAKeyIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import { OBSERVATORY_ID } from '../../../../constants/observatory-tests.constants';
import { mockCertificateDate, mockClientId } from '../../../../mocks/jwt.mocks';
import { generateNonce } from '../../../../utils/auth-nonce-tests.utils';
import { assembleJwt } from '../../../../utils/jwt-assemble-tests.utils';
import { makeMockGoogleOpenIdJwt, type MockOpenIdJwt } from '../../../../utils/jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from '../../../../utils/observatory-openid-tests.utils';
import { tick } from '../../../../utils/pic-tests.utils';
import { setupSatelliteStock } from '../../../../utils/satellite-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../../../utils/setup-tests.utils';

describe('Satellite > Delegation > Get delegation', async () => {
	let pic: PocketIc;

	let observatoryActor: Actor<ObservatoryActor>;

	let actor: Actor<SatelliteActor>;
	let controller: Ed25519KeyIdentity;

	const user = Ed25519KeyIdentity.generate();

	const sessionKey = await ECDSAKeyIdentity.generate();
	const publicKey = new Uint8Array(sessionKey.getPublicKey().toDer());

	const { nonce, salt } = await generateNonce({ caller: user });

	beforeAll(async () => {
		const {
			actor: a,
			pic: p,
			controller: cO
		} = await setupSatelliteStock({
			dateTime: mockCertificateDate,
			withIndexHtml: false,
			memory: { Heap: null }
		});

		pic = p;
		actor = a;
		controller = cO;

		const { actor: obsA } = await pic.setupCanister<ObservatoryActor>({
			idlFactory: idlFactoryObservatory,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal(),
			targetCanisterId: OBSERVATORY_ID
		});

		observatoryActor = obsA;
		observatoryActor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('should fail without configuration', async () => {
		const { jwt } = await makeMockGoogleOpenIdJwt({
			clientId: mockClientId,
			date: mockCertificateDate,
			nonce
		});

		beforeAll(() => {
			actor.setIdentity(user);
		});

		it('should fail when authentication is not configured', async () => {
			const { get_delegation } = actor;

			await expect(
				get_delegation({
					OpenId: {
						jwt,
						session_key: publicKey,
						salt
					}
				})
			).rejects.toThrow('No authentication configuration found.');
		});

		it('should not authenticate_user when OpenId disabled', async () => {
			const { set_auth_config, get_delegation } = actor;

			actor.setIdentity(controller);

			const config: SatelliteDid.SetAuthenticationConfig = {
				internet_identity: [],
				rules: [],
				openid: [],
				version: []
			};
			await set_auth_config(config);

			actor.setIdentity(user);

			await expect(
				get_delegation({
					OpenId: { jwt, session_key: publicKey, salt }
				})
			).rejects.toThrow('Authentication with OpenId disabled.');
		});
	});

	describe('with configuration', () => {
		beforeAll(async () => {
			const { set_auth_config } = actor;

			actor.setIdentity(controller);

			const config: SatelliteDid.SetAuthenticationConfig = {
				internet_identity: [],
				rules: [],
				openid: [
					{
						providers: [
							[
								{ Google: null },
								{
									client_id: mockClientId
								}
							]
						],
						observatory_id: [],
						delegation: []
					}
				],
				version: [1n]
			};
			await set_auth_config(config);

			const { start_openid_monitoring } = observatoryActor;

			await start_openid_monitoring();

			actor.setIdentity(user);
		});

		describe('JWKS not cached', () => {
			it('get_delegation returns GetCachedJwks if JWKS not cached yet', async () => {
				const now = await pic.getTime();
				const { jwt } = await makeMockGoogleOpenIdJwt({
					clientId: mockClientId,
					date: new Date(now),
					nonce
				});

				const { get_delegation } = actor;

				const delegation = await get_delegation({
					OpenId: { jwt, session_key: publicKey, salt }
				});

				if ('Ok' in delegation) {
					expect(true).toBeFalsy();

					return;
				}

				const { Err } = delegation;

				expect('GetCachedJwks' in Err).toBeTruthy();
			});
		});

		describe('Success', () => {
			let mockJwks: MockOpenIdJwt['jwks'];
			let mockJwt: MockOpenIdJwt['jwt'];

			const prepare = async (): Promise<
				| {
						userKey: Uint8Array | number[];
				  }
				| undefined
			> => {
				await pic.advanceTime(15 * 60_000);

				await tick(pic);

				const now = await pic.getTime();

				const { jwks, jwt } = await makeMockGoogleOpenIdJwt({
					clientId: mockClientId,
					date: new Date(now),
					nonce
				});

				mockJwks = jwks;
				mockJwt = jwt;

				await assertOpenIdHttpsOutcalls({ pic, jwks: mockJwks });

				const { authenticate_user } = actor;

				const result = await authenticate_user({
					OpenId: { jwt: mockJwt, session_key: publicKey, salt }
				});

				if ('Err' in result) {
					expect(true).toBeFalsy();

					return undefined;
				}

				const { Ok } = result;

				const { public_key: userKey } = Ok;
				return { userKey };
			};

			it('should return NoSuchDelegation if called before prepare (for this session_key/expiration)', async () => {
				await pic.advanceTime(15 * 60_000);
				await tick(pic);

				const now = await pic.getTime();
				const minted = await makeMockGoogleOpenIdJwt({
					clientId: mockClientId,
					date: new Date(now),
					nonce
				});

				await assertOpenIdHttpsOutcalls({ pic, jwks: minted.jwks });

				const throwaway = await ECDSAKeyIdentity.generate();
				const throwawayPub = new Uint8Array(throwaway.getPublicKey().toDer());

				const { authenticate_user } = actor;
				await authenticate_user({
					OpenId: { jwt: minted.jwt, session_key: throwawayPub, salt }
				});

				const { get_delegation } = actor;

				const res = await get_delegation({
					OpenId: { jwt: minted.jwt, session_key: publicKey, salt }
				});

				if ('Ok' in res) {
					expect(true).toBeFalsy();

					return;
				}

				expect('NoSuchDelegation' in res.Err).toBeTruthy();
			});

			it('should succeeds after prepare_delegation', async () => {
				await prepare();

				const { get_delegation } = actor;
				const delegation = await get_delegation({
					OpenId: { jwt: mockJwt, session_key: publicKey, salt }
				});

				if ('Err' in delegation) {
					expect(true).toBeFalsy();

					return;
				}

				const {
					Ok: { delegation: deg }
				} = delegation;

				expect(deg.pubkey).toBeDefined();
			});

			it('should fail with NoSuchDelegation on wrong session_key', async () => {
				await prepare();

				const otherSession = await ECDSAKeyIdentity.generate();
				const otherPub = new Uint8Array(otherSession.getPublicKey().toDer());

				const { get_delegation } = actor;
				const delegation = await get_delegation({
					OpenId: { jwt: mockJwt, session_key: otherPub, salt }
				});

				if ('Ok' in delegation) {
					expect(true).toBeFalsy();

					return;
				}

				const { Err } = delegation;

				expect('NoSuchDelegation' in Err).toBeTruthy();
			});

			it('should fail for attacker (nonce mismatch) even after prepare', async () => {
				await prepare();

				const attacker = Ed25519KeyIdentity.generate();
				actor.setIdentity(attacker);

				const { get_delegation } = actor;
				const delegation = await get_delegation({
					OpenId: { jwt: mockJwt, session_key: publicKey, salt }
				});

				actor.setIdentity(user);

				if ('Ok' in delegation) {
					expect(true).toBeFalsy();

					return;
				}

				const { Err } = delegation;

				if (!('JwtVerify' in Err)) {
					expect(true).toBeFalsy();

					return;
				}

				const { JwtVerify } = Err;

				expect((JwtVerify as { BadClaim: string }).BadClaim).toBe('nonce');
			});

			it('should map MissingKid (bad header) in get_delegation', async () => {
				const now = await pic.getTime();
				const { payload } = await makeMockGoogleOpenIdJwt({
					clientId: mockClientId,
					date: new Date(now),
					nonce
				});

				const headerNoKid = JSON.stringify({ alg: 'RS256' });
				const badJwt = assembleJwt({ header: headerNoKid, payload });

				const { get_delegation } = actor;

				const delegation = await get_delegation({
					OpenId: { jwt: badJwt, session_key: publicKey, salt }
				});

				if ('Ok' in delegation) {
					expect(true).toBeFalsy();

					return;
				}

				const { Err } = delegation;

				if (!('JwtFindProvider' in Err)) {
					return;
				}

				expect('MissingKid' in Err.JwtFindProvider).toBeTruthy();
			});
		});
	});
});
