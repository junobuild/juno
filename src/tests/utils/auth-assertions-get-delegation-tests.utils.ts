import {
	type ConsoleActor,
	idlFactoryObservatory,
	type ObservatoryActor,
	type SatelliteActor,
	type SatelliteDid
} from '$declarations';
import type { PreparedDelegation } from '$declarations/satellite/satellite.did';
import type { Actor, PocketIc } from '@dfinity/pic';
import { ECDSAKeyIdentity, Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import { JUNO_AUTH_ERROR_NOT_CONFIGURED, JUNO_AUTH_ERROR_OPENID_DISABLED } from '@junobuild/errors';
import { OBSERVATORY_ID } from '../constants/observatory-tests.constants';
import { mockCertificateDate, mockClientId } from '../mocks/jwt.mocks';
import { generateNonce } from './auth-nonce-tests.utils';
import { assembleJwt } from './jwt-assemble-tests.utils';
import { makeMockGoogleOpenIdJwt, type MockOpenIdJwt } from './jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from './observatory-openid-tests.utils';
import { tick } from './pic-tests.utils';
import { updateRateConfigNoLimit } from './rate.tests.utils';
import { OBSERVATORY_WASM_PATH } from './setup-tests.utils';

export const testAuthGetDelegation = ({
	actor: getActor,
	controller: getController,
	pic: getPic
}: {
	actor: () => Actor<SatelliteActor | ConsoleActor>;
	controller: () => Ed25519KeyIdentity;
	pic: () => PocketIc;
}) => {
	describe('Get', async () => {
		let pic: PocketIc;

		const user = Ed25519KeyIdentity.generate();

		const mockExpiration = 30n * 60n * 1_000_000_000n; // 30min

		const sessionKey = await ECDSAKeyIdentity.generate();
		const publicKey = new Uint8Array(sessionKey.getPublicKey().toDer());

		const { nonce, salt } = await generateNonce({ caller: user });

		let actor: Actor<SatelliteActor | ConsoleActor>;
		let controller: Ed25519KeyIdentity;

		let observatoryActor: Actor<ObservatoryActor>;

		beforeAll(async () => {
			pic = getPic();
			actor = getActor();
			controller = getController();

			const { actor: obsA } = await pic.setupCanister<ObservatoryActor>({
				idlFactory: idlFactoryObservatory,
				wasm: OBSERVATORY_WASM_PATH,
				sender: controller.getPrincipal(),
				targetCanisterId: OBSERVATORY_ID
			});

			observatoryActor = obsA;
			observatoryActor.setIdentity(controller);

			await updateRateConfigNoLimit({ actor: observatoryActor });
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
							salt,
							expiration: mockExpiration
						}
					})
				).rejects.toThrow(JUNO_AUTH_ERROR_NOT_CONFIGURED);
			});

			it('should not authenticate when OpenId disabled', async () => {
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
						OpenId: { jwt, session_key: publicKey, salt, expiration: mockExpiration }
					})
				).rejects.toThrow(JUNO_AUTH_ERROR_OPENID_DISABLED);
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
										client_id: mockClientId,
										delegation: []
									}
								]
							],
							observatory_id: []
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
						OpenId: { jwt, session_key: publicKey, salt, expiration: mockExpiration }
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

				const prepare = async (): Promise<{
					delegation: PreparedDelegation;
				}> => {
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

					const { authenticate } = actor;

					const result = await authenticate({
						OpenId: { jwt: mockJwt, session_key: publicKey, salt }
					});

					if ('Err' in result) {
						expect(true).toBeFalsy();

						throw new Error('Unreachable');
					}

					const { Ok } = result;

					const { delegation } = Ok;
					return { delegation };
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

					const { authenticate } = actor;
					await authenticate({
						OpenId: { jwt: minted.jwt, session_key: throwawayPub, salt }
					});

					const { get_delegation } = actor;

					const res = await get_delegation({
						OpenId: { jwt: minted.jwt, session_key: publicKey, salt, expiration: mockExpiration }
					});

					if ('Ok' in res) {
						expect(true).toBeFalsy();

						return;
					}

					expect('NoSuchDelegation' in res.Err).toBeTruthy();
				});

				it('should succeeds after prepare_delegation', async () => {
					const {
						delegation: { expiration }
					} = await prepare();

					const { get_delegation } = actor;
					const delegation = await get_delegation({
						OpenId: { jwt: mockJwt, session_key: publicKey, salt, expiration }
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

				it('should return NoSuchDelegation if a non matching expiration is passed', async () => {
					const {
						delegation: { expiration }
					} = await prepare();

					const { get_delegation } = actor;

					const res = await get_delegation({
						OpenId: { jwt: mockJwt, session_key: publicKey, salt, expiration: expiration + 1n }
					});

					if ('Ok' in res) {
						expect(true).toBeFalsy();

						return;
					}

					expect('NoSuchDelegation' in res.Err).toBeTruthy();
				});

				it('should fail with NoSuchDelegation on wrong session_key', async () => {
					const {
						delegation: { expiration }
					} = await prepare();

					const otherSession = await ECDSAKeyIdentity.generate();
					const otherPub = new Uint8Array(otherSession.getPublicKey().toDer());

					const { get_delegation } = actor;
					const delegation = await get_delegation({
						OpenId: { jwt: mockJwt, session_key: otherPub, salt, expiration }
					});

					if ('Ok' in delegation) {
						expect(true).toBeFalsy();

						return;
					}

					const { Err } = delegation;

					expect('NoSuchDelegation' in Err).toBeTruthy();
				});

				it('should fail for attacker (nonce mismatch) even after prepare', async () => {
					const {
						delegation: { expiration }
					} = await prepare();

					const attacker = Ed25519KeyIdentity.generate();
					actor.setIdentity(attacker);

					const { get_delegation } = actor;
					const delegation = await get_delegation({
						OpenId: { jwt: mockJwt, session_key: publicKey, salt, expiration }
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
						OpenId: { jwt: badJwt, session_key: publicKey, salt, expiration: mockExpiration }
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
};
