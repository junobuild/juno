import {
	idlFactoryObservatory,
	type ObservatoryActor,
	type SatelliteActor,
	type SatelliteDid
} from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import {
	JUNO_AUTH_ERROR_AUTOMATION_NOT_CONFIGURED,
	JUNO_AUTH_ERROR_OPENID_DISABLED
} from '@junobuild/errors';
import { nanoid } from 'nanoid';
import { GITHUB_ACTIONS_OPEN_ID_PROVIDER } from '../constants/auth-tests.constants';
import { OBSERVATORY_ID } from '../constants/observatory-tests.constants';
import { mockRepositoryKey } from '../mocks/automation.mocks';
import { mockCertificateDate } from '../mocks/jwt.mocks';
import { generateNonce } from './auth-nonce-tests.utils';
import { assembleJwt } from './jwt-assemble-tests.utils';
import { makeMockGitHubActionsOpenIdJwt, type MockOpenIdJwt } from './jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from './observatory-openid-tests.utils';
import { tick } from './pic-tests.utils';
import { updateRateConfigNoLimit } from './rate.tests.utils';
import { OBSERVATORY_WASM_PATH } from './setup-tests.utils';

export const testAutomationAuthenticate = ({
	actor: getActor,
	controller: getController,
	pic: getPic
}: {
	actor: () => Actor<SatelliteActor>;
	controller: () => Ed25519KeyIdentity;
	pic: () => PocketIc;
}) => {
	describe('Prepare', async () => {
		let pic: PocketIc;

		let observatoryActor: Actor<ObservatoryActor>;

		let actor: Actor<SatelliteActor>;
		let controller: Ed25519KeyIdentity;

		const automationController = Ed25519KeyIdentity.generate();

		const { nonce, salt } = await generateNonce({ caller: automationController });

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

		describe('Authenticate fails', async () => {
			const { jwt: mockJwt } = await makeMockGitHubActionsOpenIdJwt({
				date: mockCertificateDate,
				nonce
			});

			beforeAll(() => {
				actor.setIdentity(automationController);
			});

			it('should fail when automation is not configured', async () => {
				const { authenticate_automation } = actor;

				await expect(
					authenticate_automation({
						OpenId: {
							jwt: mockJwt,
							salt
						}
					})
				).rejects.toThrowError(JUNO_AUTH_ERROR_AUTOMATION_NOT_CONFIGURED);
			});

			it('should fail when openid configuration is not set', async () => {
				const { set_automation_config, authenticate_automation } = actor;

				actor.setIdentity(controller);

				const config: SatelliteDid.SetAutomationConfig = {
					openid: [],
					version: []
				};

				await set_automation_config(config);

				actor.setIdentity(automationController);

				await expect(
					authenticate_automation({
						OpenId: {
							jwt: mockJwt,
							salt
						}
					})
				).rejects.toThrowError(JUNO_AUTH_ERROR_OPENID_DISABLED);
			});
		});

		describe('Authentication', () => {
			beforeAll(async () => {
				const { set_automation_config } = actor;

				actor.setIdentity(controller);

				const config: SatelliteDid.SetAutomationConfig = {
					openid: [
						{
							providers: [
								[
									{ GitHub: null },
									{
										repositories: [[mockRepositoryKey, { branches: [] }]],
										controller: []
									}
								]
							],
							observatory_id: []
						}
					],
					version: [1n]
				};

				await set_automation_config(config);

				actor.setIdentity(automationController);
			});

			describe('Errors without Jwts', async () => {
				const { jwt: mockJwt, payload: mockJwtPayload } = await makeMockGitHubActionsOpenIdJwt({
					date: mockCertificateDate,
					nonce
				});

				describe('Bad jwt header', () => {
					it('should fail with JwtFindProvider.BadSig when JWT header is not JSON', async () => {
						const { authenticate_automation } = actor;

						// not valid JSON → decode_header fails → BadSig
						const badSigJwt = assembleJwt({ header: 'not json', payload: mockJwtPayload });

						const result = await authenticate_automation({
							OpenId: { jwt: badSigJwt, salt }
						});

						if (!('Err' in result)) {
							expect(true).toBeFalsy();

							return;
						}

						const { Err } = result;

						if (!('PrepareAutomation' in Err)) {
							expect(true).toBeFalsy();

							return;
						}

						const { PrepareAutomation } = Err;

						if (!('JwtFindProvider' in PrepareAutomation)) {
							return;
						}

						const jfp = PrepareAutomation.JwtFindProvider;

						expect('BadSig' in jfp).toBeTruthy(); // message string not asserted, just the variant
					});

					it('should fail with JwtFindProvider.BadClaim("alg") when alg is not RS256', async () => {
						const { authenticate_automation } = actor;

						const header = JSON.stringify({
							alg: 'HS256', // ← wrong on purpose
							kid: 'fb9f9371d5755f3e383a40ab3a172cd8baca517f',
							typ: 'JWT'
						});

						const badAlgJwt = assembleJwt({ header, payload: mockJwtPayload });

						const result = await authenticate_automation({
							OpenId: { jwt: badAlgJwt, salt }
						});

						if (!('Err' in result)) {
							expect(true).toBeFalsy();

							return;
						}

						const { Err } = result;

						if (!('PrepareAutomation' in Err)) {
							expect(true).toBeFalsy();

							return;
						}

						const { PrepareAutomation } = Err;

						if (!('JwtFindProvider' in PrepareAutomation)) {
							return;
						}

						const { JwtFindProvider } = PrepareAutomation;

						expect((JwtFindProvider as { BadClaim: string }).BadClaim).toEqual('alg');
					});

					it('should fail with JwtFindProvider.BadClaim("typ") when typ is present and not "JWT"', async () => {
						const { authenticate_automation } = actor;

						const header = JSON.stringify({
							alg: 'RS256',
							kid: 'fb9f9371d5755f3e383a40ab3a172cd8baca517f',
							typ: 'JWS' // ← wrong on purpose
						});

						const badTypJwt = assembleJwt({ header, payload: mockJwtPayload });

						const result = await authenticate_automation({
							OpenId: { jwt: badTypJwt, salt }
						});

						if (!('Err' in result)) {
							expect(true).toBeFalsy();

							return;
						}

						const { Err } = result;

						if (!('PrepareAutomation' in Err)) {
							expect(true).toBeFalsy();

							return;
						}

						const { PrepareAutomation } = Err;

						if (!('JwtFindProvider' in PrepareAutomation)) {
							return;
						}

						const { JwtFindProvider } = PrepareAutomation;

						expect((JwtFindProvider as { BadClaim: string }).BadClaim).toEqual('typ');
					});
				});

				it('should fail if observatory has no certificate', async () => {
					const { authenticate_automation } = actor;

					const result = await authenticate_automation({
						OpenId: {
							jwt: mockJwt,
							salt
						}
					});

					if ('Ok' in result) {
						expect(true).toBeFalsy();

						return;
					}

					const { Err } = result;

					if (!('PrepareAutomation' in Err)) {
						expect(true).toBeFalsy();

						return;
					}

					const { PrepareAutomation } = Err;

					if (!('GetOrFetchJwks' in PrepareAutomation)) {
						expect(true).toBeFalsy();

						return;
					}

					const { GetOrFetchJwks } = PrepareAutomation;

					expect('CertificateNotFound' in GetOrFetchJwks).toBeTruthy();
				});
			});

			describe('With Jwts', () => {
				let mockJwks: MockOpenIdJwt['jwks'];
				let mockJwt: MockOpenIdJwt['jwt'];

				beforeAll(async () => {
					actor.setIdentity(controller);

					const { start_openid_monitoring } = observatoryActor;

					await start_openid_monitoring(GITHUB_ACTIONS_OPEN_ID_PROVIDER);

					actor.setIdentity(automationController);
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

					const { jwks, jwt } = await makeMockGitHubActionsOpenIdJwt({
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
					await assertOpenIdHttpsOutcalls({ pic, jwks: mockJwks, method: 'github_actions' });
				};

				it('should fail at authenticating because fetching Jwts is disallowed (cooldown period)', async () => {
					await generateJwtCertificate({ advanceTime: 1000 });

					const { authenticate_automation } = actor;

					const result = await authenticate_automation({
						OpenId: {
							jwt: mockJwt,
							salt
						}
					});

					if ('Ok' in result) {
						expect(true).toBeFalsy();

						return;
					}

					const { Err } = result;

					if (!('PrepareAutomation' in Err)) {
						expect(true).toBeFalsy();

						return;
					}

					const { PrepareAutomation } = Err;

					if (!('GetOrFetchJwks' in PrepareAutomation)) {
						expect(true).toBeFalsy();

						return;
					}

					const { GetOrFetchJwks } = PrepareAutomation;

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

						const { authenticate_automation } = actor;

						const result = await authenticate_automation({
							OpenId: {
								jwt: mockJwt,
								salt
							}
						});

						if ('Ok' in result) {
							expect(true).toBeFalsy();

							return;
						}

						const { Err } = result;

						if (!('PrepareAutomation' in Err)) {
							expect(true).toBeFalsy();

							return;
						}

						const { PrepareAutomation } = Err;

						if (!('GetOrFetchJwks' in PrepareAutomation)) {
							expect(true).toBeFalsy();

							return;
						}

						const { GetOrFetchJwks } = PrepareAutomation;

						expect('KeyNotFound' in GetOrFetchJwks).toBeTruthy();
					});

					it('should fetch certificate but fail with invalid signature', async () => {
						await generateJwtCertificate({ advanceTime: 1000 * 60, refreshJwts: false, kid });

						const { authenticate_automation } = actor;

						const result = await authenticate_automation({
							OpenId: {
								jwt: mockJwt,
								salt
							}
						});

						if ('Ok' in result) {
							expect(true).toBeFalsy();

							return;
						}

						const { Err } = result;

						if (!('PrepareAutomation' in Err)) {
							expect(true).toBeFalsy();

							return;
						}

						const { PrepareAutomation } = Err;

						if (!('JwtVerify' in PrepareAutomation)) {
							expect(true).toBeFalsy();

							return;
						}

						const { JwtVerify } = PrepareAutomation;

						expect('BadSig' in JwtVerify).toBeTruthy();
						expect((JwtVerify as { BadSig: string }).BadSig).toEqual('InvalidSignature');
					});
				});

				it('should authenticate user', async () => {
					await generateJwtCertificate({});

					const { authenticate_automation } = actor;

					const result = await authenticate_automation({
						OpenId: {
							jwt: mockJwt,
							salt
						}
					});

					expect('Ok' in result).toBeTruthy();
				});

				it('should fail at authenticating attacker', async () => {
					await generateJwtCertificate({});

					const attacker = Ed25519KeyIdentity.generate();
					actor.setIdentity(attacker);

					const { authenticate_automation } = actor;

					const result = await authenticate_automation({
						OpenId: {
							jwt: mockJwt,
							salt
						}
					});

					if ('Ok' in result) {
						expect(true).toBeFalsy();

						return;
					}

					const { Err } = result;

					if (!('PrepareAutomation' in Err)) {
						expect(true).toBeFalsy();

						return;
					}

					const { PrepareAutomation } = Err;

					if (!('JwtVerify' in PrepareAutomation)) {
						expect(true).toBeFalsy();

						return;
					}

					const { JwtVerify } = PrepareAutomation;

					expect('BadClaim' in JwtVerify).toBeTruthy();
					expect((JwtVerify as { BadClaim: string }).BadClaim).toEqual('nonce');

					actor.setIdentity(automationController);
				});

				it('should fail when salt is wrong for the same user (nonce mismatch)', async () => {
					await generateJwtCertificate({});

					const wrongSalt = crypto.getRandomValues(new Uint8Array(32));

					const { authenticate_automation } = actor;
					const result = await authenticate_automation({
						OpenId: { jwt: mockJwt, salt: wrongSalt }
					});

					if ('Ok' in result) {
						expect(true).toBeFalsy();

						return;
					}

					const { Err } = result;

					if (!('PrepareAutomation' in Err)) {
						expect(true).toBeFalsy();

						return;
					}

					const { PrepareAutomation } = Err;

					if (!('JwtVerify' in PrepareAutomation)) {
						expect(true).toBeFalsy();

						return;
					}

					expect((PrepareAutomation.JwtVerify as { BadClaim: string }).BadClaim).toEqual('nonce');
				});

				it('should fail when token is replayed after 10 minutes (iat_expired)', async () => {
					await generateJwtCertificate({});

					await pic.advanceTime(10 * 60_000 + 1_000);
					await tick(pic);

					const { authenticate_automation } = actor;
					const result = await authenticate_automation({
						OpenId: { jwt: mockJwt, salt }
					});

					if ('Ok' in result) {
						expect(true).toBeFalsy();

						return;
					}

					const { Err } = result;

					if (!('PrepareAutomation' in Err)) {
						expect(true).toBeFalsy();

						return;
					}

					const { PrepareAutomation } = Err;

					if (!('JwtVerify' in PrepareAutomation)) {
						expect(true).toBeFalsy();

						return;
					}

					expect((PrepareAutomation.JwtVerify as { BadClaim: string }).BadClaim).toEqual(
						'iat_expired'
					);
				});

				it('should fail when audience does not match', async () => {
					await pic.advanceTime(15 * 60_000);
					await tick(pic);

					const now = await pic.getTime();

					const { jwks, jwt } = await makeMockGitHubActionsOpenIdJwt({
						date: new Date(now),
						nonce: 'wrong-nonce' // nonce is passed as aud
					});

					await assertOpenIdHttpsOutcalls({ pic, jwks, method: 'github_actions' });

					const { authenticate_automation } = actor;
					const result = await authenticate_automation({
						OpenId: { jwt, salt }
					});

					if ('Ok' in result) {
						expect(true).toBeFalsy();

						return;
					}

					const { Err } = result;

					if (!('PrepareAutomation' in Err)) {
						expect(true).toBeFalsy();

						return;
					}

					const { PrepareAutomation } = Err;

					if (!('JwtVerify' in PrepareAutomation)) {
						expect(true).toBeFalsy();

						return;
					}

					expect((PrepareAutomation.JwtVerify as { BadClaim: string }).BadClaim).toEqual('nonce');
				});

				it('should pass jwt verification if iat is slightly in the future (within skew) but controller already exists', async () => {
					await pic.advanceTime(15 * 60_000);
					await tick(pic);

					const base = await pic.getTime();
					const future60s = new Date(base + 60_000);

					const { jwks, jwt } = await makeMockGitHubActionsOpenIdJwt({
						date: future60s,
						nonce
					});

					await assertOpenIdHttpsOutcalls({ pic, jwks, method: 'github_actions' });

					const { authenticate_automation } = actor;
					const result = await authenticate_automation({
						OpenId: { jwt, salt }
					});

					if ('Ok' in result) {
						expect(true).toBeFalsy();

						return;
					}

					const { Err } = result;

					if (!('PrepareAutomation' in Err)) {
						expect(true).toBeFalsy();

						return;
					}

					const { PrepareAutomation } = Err;

					expect('ControllerAlreadyExists' in PrepareAutomation).toBeTruthy();
				});

				it('should fail when iat is beyond future skew', async () => {
					await pic.advanceTime(15 * 60_000);
					await tick(pic);

					const base = await pic.getTime();
					const future3min = new Date(base + 3 * 60_000);

					const { jwks, jwt } = await makeMockGitHubActionsOpenIdJwt({
						date: future3min,
						nonce
					});

					await assertOpenIdHttpsOutcalls({ pic, jwks, method: 'github_actions' });

					const { authenticate_automation } = actor;
					const result = await authenticate_automation({
						OpenId: { jwt, salt }
					});

					if ('Ok' in result) {
						expect(true).toBeFalsy();

						return;
					}

					const { Err } = result;

					if (!('PrepareAutomation' in Err)) {
						expect(true).toBeFalsy();

						return;
					}

					const { PrepareAutomation } = Err;

					if (!('JwtVerify' in PrepareAutomation)) {
						expect(true).toBeFalsy();

						return;
					}

					expect((PrepareAutomation.JwtVerify as { BadClaim: string }).BadClaim).toEqual(
						'iat_future'
					);
				});

				it('should fail when iat is older than 10 minutes', async () => {
					await pic.advanceTime(15 * 60_000);
					await tick(pic);

					const base = await pic.getTime();
					const { jwks, jwt } = await makeMockGitHubActionsOpenIdJwt({
						date: new Date(base),
						nonce
					});

					await assertOpenIdHttpsOutcalls({ pic, jwks, method: 'github_actions' });

					await pic.advanceTime(10 * 60_000 + 1_000);
					await tick(pic);

					const { authenticate_automation } = actor;
					const result = await authenticate_automation({
						OpenId: { jwt, salt }
					});

					if ('Ok' in result) {
						expect(true).toBeFalsy();

						return;
					}

					const { Err } = result;

					if (!('PrepareAutomation' in Err)) {
						expect(true).toBeFalsy();

						return;
					}

					const { PrepareAutomation } = Err;

					if (!('JwtVerify' in PrepareAutomation)) {
						expect(true).toBeFalsy();

						return;
					}

					expect((PrepareAutomation.JwtVerify as { BadClaim: string }).BadClaim).toEqual(
						'iat_expired'
					);
				});

				it('should fail when JWT header has no kid', async () => {
					const now = await pic.getTime();

					const { payload } = await makeMockGitHubActionsOpenIdJwt({
						date: new Date(now),
						nonce
					});

					const headerNoKid = JSON.stringify({ alg: 'RS256' });
					const badJwt = assembleJwt({ header: headerNoKid, payload });

					const { authenticate_automation } = actor;
					const result = await authenticate_automation({
						OpenId: { jwt: badJwt, salt }
					});

					if ('Ok' in result) {
						expect(true).toBeFalsy();

						return;
					}

					const { Err } = result;

					if (!('PrepareAutomation' in Err)) {
						expect(true).toBeFalsy();

						return;
					}

					const { PrepareAutomation } = Err;

					if (!('GetOrFetchJwks' in PrepareAutomation)) {
						expect(true).toBeFalsy();

						return;
					}

					const { GetOrFetchJwks } = PrepareAutomation;

					expect('MissingKid' in GetOrFetchJwks).toBeTruthy();
				});

				it('should fail when JWKS key type is not RSA (WrongKeyType)', async () => {
					await pic.advanceTime(15 * 60_000);
					await tick(pic);

					const now = await pic.getTime();
					const { jwt, kid } = await makeMockGitHubActionsOpenIdJwt({
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

					await assertOpenIdHttpsOutcalls({ pic, jwks: ecJwks, method: 'github_actions' });

					const { authenticate_automation } = actor;
					const result = await authenticate_automation({
						OpenId: { jwt, salt }
					});

					if ('Ok' in result) {
						expect(true).toBeFalsy();

						return;
					}

					const { Err } = result;

					if (!('PrepareAutomation' in Err)) {
						expect(true).toBeFalsy();

						return;
					}

					const { PrepareAutomation } = Err;

					if (!('JwtVerify' in PrepareAutomation)) {
						expect(true).toBeFalsy();

						return;
					}

					const { JwtVerify } = PrepareAutomation;

					expect('WrongKeyType' in JwtVerify).toBeTruthy();
				});

				it('should fail when nbf is in the future', async () => {
					await pic.advanceTime(15 * 60_000);
					await tick(pic);

					const now = await pic.getTime();
					const base = Math.floor(now / 1000);

					const { jwks, kid } = await makeMockGitHubActionsOpenIdJwt({
						date: new Date(now),
						nonce
					});
					await assertOpenIdHttpsOutcalls({ pic, jwks, method: 'github_actions' });

					const { owner, name } = mockRepositoryKey;

					const payload = {
						iss: 'https://token.actions.githubusercontent.com',
						sub: `repo:${owner}/${name}:ref:refs/heads/main`,
						aud: nonce,
						iat: base,
						exp: base + 3600,
						nbf: base + 300,
						jti: nanoid(),
						ref: 'refs/heads/main',
						repository_owner: owner,
						run_id: '21776509605',
						run_attempt: '1',
						repository: `${owner}/${name}`,
						run_number: '1'
					} as const;

					const header = JSON.stringify({ alg: 'RS256', kid, typ: 'JWT' });
					const badNbfJwt = assembleJwt({ header, payload });

					const { authenticate_automation } = actor;
					const result = await authenticate_automation({
						OpenId: { jwt: badNbfJwt, salt }
					});

					if ('Ok' in result) {
						expect(true).toBeFalsy();

						return;
					}

					const { Err } = result;

					if (!('PrepareAutomation' in Err)) {
						expect(true).toBeFalsy();

						return;
					}

					const { PrepareAutomation } = Err;

					if (!('JwtVerify' in PrepareAutomation)) {
						expect(true).toBeFalsy();

						return;
					}

					const { JwtVerify } = PrepareAutomation;

					expect('BadSig' in JwtVerify).toBeTruthy();
				});
			});
		});
	});
};
