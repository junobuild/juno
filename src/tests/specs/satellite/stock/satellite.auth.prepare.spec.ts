import {
	idlFactoryObservatory,
	type ObservatoryActor,
	type SatelliteActor,
	type SatelliteDid
} from '$declarations';
import { ECDSAKeyIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { inject } from 'vitest';
import { OBSERVATORY_ID } from '../../../constants/observatory-tests.constants';
import { mockCertificateDate, mockClientId } from '../../../mocks/jwt.mocks';
import { assembleJwt } from '../../../utils/jwt-assemble-tests.utils';
import { makeMockGoogleOpenIdJwt } from '../../../utils/jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from '../../../utils/observatory-openid-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import { setupSatelliteStock } from '../../../utils/satellite-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../../utils/setup-tests.utils';

describe('Satellite > Authentication > Prepare', async () => {
	let pic: PocketIc;

	let observatoryActor: Actor<ObservatoryActor>;

	let canisterId: Principal;
	let actor: Actor<SatelliteActor>;
	let controller: Ed25519KeyIdentity;
	let canisterIdUrl: string;

	const {
		jwks: mockJwks,
		jwt: mockJwt,
		payload: mockJwtPayload
	} = await makeMockGoogleOpenIdJwt({
		clientId: mockClientId,
		date: mockCertificateDate
	});

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		await pic.setTime(mockCertificateDate.getTime());

		const {
			actor: a,
			canisterId: c,
			pic: p,
			controller: cO,
			canisterIdUrl: url
		} = await setupSatelliteStock();

		pic = p;
		canisterId = c;
		actor = a;
		controller = cO;
		canisterIdUrl = url;

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

	describe('Authenticate user fails', async () => {
		const user = Ed25519KeyIdentity.generate();

		const sessionKey = await ECDSAKeyIdentity.generate();
		const publicKey = new Uint8Array(sessionKey.getPublicKey().toDer());
		const salt = crypto.getRandomValues(new Uint8Array(32));

		beforeAll(() => {
			actor.setIdentity(user);
		});

		it('should fail when authentication is not configured', async () => {
			const { authenticate_user } = actor;

			await expect(
				authenticate_user({
					OpenId: {
						jwt: mockJwt,
						session_key: publicKey,
						salt
					}
				})
			).rejects.toThrow('No authentication configuration found.');
		});

		it('should fail when openid configuration is not set', async () => {
			const { set_auth_config, authenticate_user } = actor;

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
				authenticate_user({
					OpenId: {
						jwt: mockJwt,
						session_key: publicKey,
						salt
					}
				})
			).rejects.toThrow('Authentication with OpenId disabled.');
		});
	});

	describe('Authentication with Google', async () => {
		const user = Ed25519KeyIdentity.generate();

		const sessionKey = await ECDSAKeyIdentity.generate();
		const publicKey = new Uint8Array(sessionKey.getPublicKey().toDer());
		const salt = crypto.getRandomValues(new Uint8Array(32));

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
						]
					}
				],
				version: [1n]
			};

			await set_auth_config(config);

			actor.setIdentity(user);
		});

		describe('Errors', () => {
			describe('Bad jwt header', () => {
				it('should fail with JwtFindProvider.BadSig when JWT header is not JSON', async () => {
					const { authenticate_user } = actor;

					// not valid JSON → decode_header fails → BadSig
					const badSigJwt = assembleJwt({ header: 'not json', payload: mockJwtPayload });

					const { delegation } = await authenticate_user({
						OpenId: { jwt: badSigJwt, session_key: publicKey, salt }
					});

					expect('Err' in delegation).toBeTruthy();

					if (!('Err' in delegation)) {
						return;
					}

					const { Err } = delegation;

					expect('JwtFindProvider' in Err).toBeTruthy();

					if (!('JwtFindProvider' in Err)) {
						return;
					}

					const jfp = Err.JwtFindProvider;

					expect('BadSig' in jfp).toBeTruthy(); // message string not asserted, just the variant
				});

				it('should fail with JwtFindProvider.BadClaim("alg") when alg is not RS256', async () => {
					const { authenticate_user } = actor;

					const header = JSON.stringify({
						alg: 'HS256', // ← wrong on purpose
						kid: 'fb9f9371d5755f3e383a40ab3a172cd8baca517f',
						typ: 'JWT'
					});

					const badAlgJwt = assembleJwt({ header, payload: mockJwtPayload });

					const { delegation } = await authenticate_user({
						OpenId: { jwt: badAlgJwt, session_key: publicKey, salt }
					});

					expect('Err' in delegation).toBeTruthy();

					const { Err } = delegation as Extract<typeof delegation, { Err: unknown }>;

					expect('JwtFindProvider' in Err).toBeTruthy();

					const jfp = (Err as any).JwtFindProvider;

					expect('BadClaim' in jfp).toBeTruthy();
					expect(jfp.BadClaim).toBe('alg');
				});

				it('should fail with JwtFindProvider.BadClaim("typ") when typ is present and not "JWT"', async () => {
					const { authenticate_user } = actor;

					const header = JSON.stringify({
						alg: 'RS256',
						kid: 'fb9f9371d5755f3e383a40ab3a172cd8baca517f',
						typ: 'JWS' // ← wrong on purpose
					});

					const badTypJwt = assembleJwt({ header, payload: mockJwtPayload });

					const { delegation } = await authenticate_user({
						OpenId: { jwt: badTypJwt, session_key: publicKey, salt }
					});

					expect('Err' in delegation).toBeTruthy();

					const { Err } = delegation as Extract<typeof delegation, { Err: unknown }>;

					expect('JwtFindProvider' in Err).toBeTruthy();

					const jfp = (Err as any).JwtFindProvider;

					expect('BadClaim' in jfp).toBeTruthy();
					expect(jfp.BadClaim).toBe('typ');
				});
			});

			it('should fail if observatory has no certificate', async () => {
				const { authenticate_user } = actor;

				const { delegation } = await authenticate_user({
					OpenId: {
						jwt: mockJwt,
						session_key: publicKey,
						salt
					}
				});

				if ('Ok' in delegation) {
					expect(true).toBeFalsy();

					return;
				}

				const { Err } = delegation;

				if (!('GetOrFetchJwks' in Err)) {
					expect(true).toBeFalsy();

					return;
				}

				const { GetOrFetchJwks } = Err;

				expect('CertificateNotFound' in GetOrFetchJwks).toBeTruthy();
			});
		});

		describe('Success', () => {
			beforeAll(async () => {
				const { start_openid_monitoring } = observatoryActor;

				actor.setIdentity(controller);

				await start_openid_monitoring();

				await assertOpenIdHttpsOutcalls({ pic, jwks: mockJwks });
			});

			it('should authenticate user', async () => {
				const { authenticate_user } = actor;

				await pic.advanceTime(1000 * 60 * 15); // 15min. We tried few times above with errors

				await tick(pic);

				const { delegation } = await authenticate_user({
					OpenId: {
						jwt: mockJwt,
						session_key: publicKey,
						salt
					}
				});

				console.log(delegation);

				if ('Ok' in delegation) {
					expect(true).toBeFalsy();

					return;
				}

				const { Err } = delegation;

				if (!('GetOrFetchJwks' in Err)) {
					expect(true).toBeFalsy();

					return;
				}

				const { GetOrFetchJwks } = Err;

				expect('CertificateNotFound' in GetOrFetchJwks).toBeTruthy();
			});
		});
	});
});
