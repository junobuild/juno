import {
	idlFactoryObservatory,
	type ObservatoryActor,
	type SatelliteActor,
	type SatelliteDid
} from '$declarations';
import { ECDSAKeyIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { nanoid } from 'nanoid';
import { OBSERVATORY_ID } from '../../../constants/observatory-tests.constants';
import { mockCertificateDate, mockClientId } from '../../../mocks/jwt.mocks';
import { generateNonce } from '../../../utils/auth-nonce-tests.utils';
import { assembleJwt } from '../../../utils/jwt-assemble-tests.utils';
import { makeMockGoogleOpenIdJwt, type MockOpenIdJwt } from '../../../utils/jwt-tests.utils';
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

	const user = Ed25519KeyIdentity.generate();

	const sessionKey = await ECDSAKeyIdentity.generate();
	const publicKey = new Uint8Array(sessionKey.getPublicKey().toDer());

	const { nonce, salt } = await generateNonce({ caller: user });

	beforeAll(async () => {
		const {
			actor: a,
			canisterId: c,
			pic: p,
			controller: cO,
			canisterIdUrl: url
		} = await setupSatelliteStock({
			dateTime: mockCertificateDate,
			withIndexHtml: false,
			memory: { Heap: null }
		});

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
		const { jwt: mockJwt } = await makeMockGoogleOpenIdJwt({
			clientId: mockClientId,
			date: mockCertificateDate,
			nonce
		});

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

		describe('Errors without Jwts', async () => {
			const { jwt: mockJwt, payload: mockJwtPayload } = await makeMockGoogleOpenIdJwt({
				clientId: mockClientId,
				date: mockCertificateDate,
				nonce
			});

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

		describe('With Jwts', async () => {
			let mockJwks: MockOpenIdJwt['jwks'];
			let mockJwt: MockOpenIdJwt['jwt'];

			beforeAll(async () => {
				actor.setIdentity(controller);

				const { start_openid_monitoring } = observatoryActor;

				await start_openid_monitoring();

				actor.setIdentity(user);
			});

			const generateJwtCertificate = async ({
				advanceTime,
				refreshJwts = true,
				kid
			}: {
				advanceTime?: number;
				refreshJwts?: boolean;
				kid?: string;
			}) => {
				await pic.advanceTime(advanceTime ?? 1000 * 60 * 15); // Observatory refresh every 15min

				await tick(pic);

				const now = await pic.getTime();

				const { jwks, jwt } = await makeMockGoogleOpenIdJwt({
					clientId: mockClientId,
					date: new Date(now),
					nonce,
					kid
				});

				mockJwks = jwks;
				mockJwt = jwt;

				if (!refreshJwts) {
					return;
				}

				// Refresh certificate in Observatory
				await assertOpenIdHttpsOutcalls({ pic, jwks: mockJwks });
			};

			it('should fail at authenticating because fetching Jwts is disallowed (cooldown period)', async () => {
				await generateJwtCertificate({ advanceTime: 1000 });

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

				expect('KeyNotFoundCooldown' in GetOrFetchJwks).toBeTruthy();
			});

			describe('Kid', () => {
				const kid = nanoid();

				beforeEach(async () => {
					// Generate for Kid and update certificate in Observatory
					await generateJwtCertificate({ advanceTime: 1000 * 60 * 15, refreshJwts: true, kid });
				});

				it('should fetch certificate but fail with kid not found', async () => {
					await generateJwtCertificate({ advanceTime: 1000 * 60, refreshJwts: false });

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

					expect('KeyNotFound' in GetOrFetchJwks).toBeTruthy();
				});

				it('should fetch certificate but fail with invalid signature', async () => {
					await generateJwtCertificate({ advanceTime: 1000 * 60, refreshJwts: false, kid });

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

					if (!('JwtVerify' in Err)) {
						expect(true).toBeFalsy();

						return;
					}

					const { JwtVerify } = Err;

					expect('BadSig' in JwtVerify).toBeTruthy();
					expect((JwtVerify as { BadSig: string }).BadSig).toEqual('InvalidSignature');
				});
			});

			it('should authenticate user', async () => {
				await generateJwtCertificate({});

				const { authenticate_user } = actor;

				const { delegation } = await authenticate_user({
					OpenId: {
						jwt: mockJwt,
						session_key: publicKey,
						salt
					}
				});

				expect('Ok' in delegation).toBeTruthy();
			});

			it('should fail at authenticating attacker', async () => {
				await generateJwtCertificate({});

				const attacker = Ed25519KeyIdentity.generate();
				actor.setIdentity(attacker);

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

				if (!('JwtVerify' in Err)) {
					expect(true).toBeFalsy();

					return;
				}

				const { JwtVerify } = Err;

				expect('BadClaim' in JwtVerify).toBeTruthy();
				expect((JwtVerify as { BadClaim: string }).BadClaim).toEqual('nonce');

				actor.setIdentity(user);
			});

			it('should fail when salt is wrong for the same user (nonce mismatch)', async () => {
				await generateJwtCertificate({});

				const wrongSalt = crypto.getRandomValues(new Uint8Array(32));

				const { authenticate_user } = actor;
				const { delegation } = await authenticate_user({
					OpenId: { jwt: mockJwt, session_key: publicKey, salt: wrongSalt }
				});

				if ('Ok' in delegation) {
					expect(true).toBeFalsy();

					return;
				}

				const { Err } = delegation;

				if (!('JwtVerify' in Err)) {
					expect(true).toBeFalsy();

					return;
				}

				expect((Err.JwtVerify as { BadClaim: string }).BadClaim).toEqual('nonce');
			});

			it('should fail when token is replayed after 10 minutes (iat_expired)', async () => {
				await generateJwtCertificate({});

				await pic.advanceTime(10 * 60_000 + 1_000);
				await tick(pic);

				const { authenticate_user } = actor;
				const { delegation } = await authenticate_user({
					OpenId: { jwt: mockJwt, session_key: publicKey, salt }
				});

				if ('Ok' in delegation) {
					expect(true).toBeFalsy();

					return;
				}

				const { Err } = delegation;

				if (!('JwtVerify' in Err)) {
					expect(true).toBeFalsy();

					return;
				}

				expect((Err.JwtVerify as { BadClaim: string }).BadClaim).toEqual('iat_expired');
			});

			it('should fail when audience does not match', async () => {
				await pic.advanceTime(15 * 60_000);
				await tick(pic);

				const now = await pic.getTime();

				const { jwks, jwt } = await makeMockGoogleOpenIdJwt({
					clientId: 'wrong-client-id.apps.googleusercontent.com',
					date: new Date(now),
					nonce
				});

				await assertOpenIdHttpsOutcalls({ pic, jwks });

				const { authenticate_user } = actor;
				const { delegation } = await authenticate_user({
					OpenId: { jwt, session_key: publicKey, salt }
				});

				if ('Ok' in delegation) {
					expect(true).toBeFalsy();

					return;
				}

				const { Err } = delegation;

				if (!('JwtVerify' in Err)) {
					expect(true).toBeFalsy();

					return;
				}

				expect((Err.JwtVerify as { BadClaim: string }).BadClaim).toEqual('aud');
			});

			it('should authenticates when iat is slightly in the future (within skew)', async () => {
				await pic.advanceTime(15 * 60_000);
				await tick(pic);

				const base = await pic.getTime();
				const future60s = new Date(base + 60_000);

				const { jwks, jwt } = await makeMockGoogleOpenIdJwt({
					clientId: mockClientId,
					date: future60s,
					nonce
				});

				await assertOpenIdHttpsOutcalls({ pic, jwks });

				const { authenticate_user } = actor;
				const { delegation } = await authenticate_user({
					OpenId: { jwt, session_key: publicKey, salt }
				});

				expect('Ok' in delegation).toBeTruthy();
			});

			it('should fail when iat is beyond future skew', async () => {
				await pic.advanceTime(15 * 60_000);
				await tick(pic);

				const base = await pic.getTime();
				const future3min = new Date(base + 3 * 60_000);

				const { jwks, jwt } = await makeMockGoogleOpenIdJwt({
					clientId: mockClientId,
					date: future3min,
					nonce
				});

				await assertOpenIdHttpsOutcalls({ pic, jwks });

				const { authenticate_user } = actor;
				const { delegation } = await authenticate_user({
					OpenId: { jwt, session_key: publicKey, salt }
				});

				if ('Ok' in delegation) {
					expect(true).toBeFalsy();

					return;
				}

				const { Err } = delegation;

				if (!('JwtVerify' in Err)) {
					expect(true).toBeFalsy();

					return;
				}

				expect((Err.JwtVerify as { BadClaim: string }).BadClaim).toEqual('iat_future');
			});

			it('should fail when iat is older than 10 minutes', async () => {
				await pic.advanceTime(15 * 60_000);
				await tick(pic);

				const base = await pic.getTime();
				const { jwks, jwt } = await makeMockGoogleOpenIdJwt({
					clientId: mockClientId,
					date: new Date(base),
					nonce
				});

				await assertOpenIdHttpsOutcalls({ pic, jwks });

				await pic.advanceTime(10 * 60_000 + 1_000);
				await tick(pic);

				const { authenticate_user } = actor;
				const { delegation } = await authenticate_user({
					OpenId: { jwt, session_key: publicKey, salt }
				});

				if ('Ok' in delegation) {
					expect(true).toBeFalsy();

					return;
				}

				const { Err } = delegation;

				if (!('JwtVerify' in Err)) {
					expect(true).toBeFalsy();

					return;
				}

				expect((Err.JwtVerify as { BadClaim: string }).BadClaim).toEqual('iat_expired');
			});

			it('should fail when JWT header has no kid', async () => {
				const now = await pic.getTime();

				const { payload } = await makeMockGoogleOpenIdJwt({
					clientId: mockClientId,
					date: new Date(now),
					nonce
				});

				const headerNoKid = JSON.stringify({ alg: 'RS256' });
				const badJwt = assembleJwt({ header: headerNoKid, payload });

				const { authenticate_user } = actor;
				const { delegation } = await authenticate_user({
					OpenId: { jwt: badJwt, session_key: publicKey, salt }
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

				expect('MissingKid' in GetOrFetchJwks).toBeTruthy();
			});

			it('should fail when JWKS key type is not RSA (WrongKeyType)', async () => {
				await pic.advanceTime(15 * 60_000);
				await tick(pic);

				const now = await pic.getTime();
				const { jwt, kid } = await makeMockGoogleOpenIdJwt({
					clientId: mockClientId,
					date: new Date(now),
					nonce
				});

				const ecJwks = {
					keys: [
						{
							kty: 'EC',
							alg: 'ES256',
							kid,
							crv: 'P-256',
							x: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
							y: 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'
						}
					]
				} as unknown as MockOpenIdJwt['jwks'];

				await assertOpenIdHttpsOutcalls({ pic, jwks: ecJwks });

				const { authenticate_user } = actor;
				const { delegation } = await authenticate_user({
					OpenId: { jwt, session_key: publicKey, salt }
				});

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

				expect('WrongKeyType' in JwtVerify).toBeTruthy();
			});

			it('should fail when nbf is in the future', async () => {
				await pic.advanceTime(15 * 60_000);
				await tick(pic);

				const now = await pic.getTime();
				const base = Math.floor(now / 1000);

				const { jwks, kid } = await makeMockGoogleOpenIdJwt({
					clientId: mockClientId,
					date: new Date(now),
					nonce
				});
				await assertOpenIdHttpsOutcalls({ pic, jwks });

				const payload = {
					iss: 'https://accounts.google.com',
					sub: 'sub',
					email: 'user@example.com',
					email_verified: true,
					aud: mockClientId,
					iat: base,
					exp: base + 3600,
					nbf: base + 300,
					nonce
				};

				const header = JSON.stringify({ alg: 'RS256', kid, typ: 'JWT' });
				const badNbfJwt = assembleJwt({ header, payload });

				const { authenticate_user } = actor;
				const { delegation } = await authenticate_user({
					OpenId: { jwt: badNbfJwt, session_key: publicKey, salt }
				});

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

				expect('BadSig' in JwtVerify).toBeTruthy();
			});
		});
	});
});
