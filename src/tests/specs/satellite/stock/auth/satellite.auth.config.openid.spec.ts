import {
	idlFactoryObservatory,
	type ObservatoryActor,
	type SatelliteActor,
	type SatelliteDid
} from '$declarations';
import { ECDSAKeyIdentity, Ed25519KeyIdentity } from '@dfinity/identity';
import type { Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { mockCertificateDate, mockClientId } from '../../../../mocks/jwt.mocks';
import { generateNonce } from '../../../../utils/auth-nonce-tests.utils';
import { makeMockGoogleOpenIdJwt } from '../../../../utils/jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from '../../../../utils/observatory-openid-tests.utils';
import { tick } from '../../../../utils/pic-tests.utils';
import { setupSatelliteStock } from '../../../../utils/satellite-tests.utils';
import { OBSERVATORY_WASM_PATH } from '../../../../utils/setup-tests.utils';

describe('Satellite > Authentication > Prepare', async () => {
	let pic: PocketIc;

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

		actor.setIdentity(user);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('Observatory', () => {
		let observatoryActor: Actor<ObservatoryActor>;
		let observatoryCanisterId: Principal;
		let mockJwt: string;

		const configTargetObservatory = async ({
			observatoryId,
			version
		}: {
			observatoryId?: Principal;
			version?: bigint;
		}) => {
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
						observatory_id: toNullable(observatoryId)
					}
				],
				version: toNullable(version)
			};

			await set_auth_config(config);

			actor.setIdentity(user);
		};

		beforeAll(async () => {
			const { actor: obsA, canisterId: obsC } = await pic.setupCanister<ObservatoryActor>({
				idlFactory: idlFactoryObservatory,
				wasm: OBSERVATORY_WASM_PATH,
				sender: controller.getPrincipal()
			});

			observatoryActor = obsA;
			observatoryCanisterId = obsC;

			observatoryActor.setIdentity(controller);

			const { start_openid_monitoring } = observatoryActor;
			await start_openid_monitoring();

			await pic.advanceTime(1000 * 60 * 15); // Observatory refresh every 15min
			await tick(pic);

			const now = await pic.getTime();

			const { jwks, jwt } = await makeMockGoogleOpenIdJwt({
				clientId: mockClientId,
				date: new Date(now),
				nonce
			});

			// Refresh certificate in Observatory
			await assertOpenIdHttpsOutcalls({ pic, jwks });

			mockJwt = jwt;
		});

		it('should fail if default observatory is targeted', async () => {
			await configTargetObservatory({});

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

			if (!('FetchFailed' in GetOrFetchJwks)) {
				expect(true).toBeFalsy();

				return;
			}

			const { FetchFailed } = GetOrFetchJwks;

			expect(FetchFailed).toEqual(
				'Fetching OpenID certificate failed: CallRejected(CallRejected { raw_reject_code: 3, reject_message: "No route to canister klbfr-lqaaa-aaaak-qbwsa-cai" })'
			);
		});

		it('should succeed with custom observatory jwts', async () => {
			await configTargetObservatory({ version: 1n, observatoryId: observatoryCanisterId });

			await pic.advanceTime(1000 * 30); // 30s for cooldown guard
			await tick(pic);

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
	});
});
