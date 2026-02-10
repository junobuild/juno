import {
	idlFactoryObservatory,
	type ObservatoryActor,
	type SatelliteActor,
	type SatelliteDid
} from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { GITHUB_ACTIONS_OPEN_ID_PROVIDER, GOOGLE_OPEN_ID_PROVIDER } from '../constants/auth-tests.constants';
import { mockRepositoryKey } from '../mocks/automation.mocks';
import { mockGoogleClientId } from '../mocks/jwt.mocks';
import { generateNonce } from './auth-nonce-tests.utils';
import { makeMockGoogleOpenIdJwt } from './jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from './observatory-openid-tests.utils';
import { tick } from './pic-tests.utils';
import { updateRateConfigNoLimit } from './rate.tests.utils';
import { OBSERVATORY_WASM_PATH } from './setup-tests.utils';

export const testAutomationConfigObservatory = ({
	actor: getActor,
	controller: getController,
	pic: getPic
}: {
	actor: () => Actor<SatelliteActor>;
	controller: () => Ed25519KeyIdentity;
	pic: () => PocketIc;
}) => {
	describe('Observatory', async () => {
		let observatoryActor: Actor<ObservatoryActor>;
		let observatoryCanisterId: Principal;
		let mockJwt: string;

		const identity = Ed25519KeyIdentity.generate();

		const { nonce, salt } = await generateNonce({ caller: identity });

		const configTargetObservatory = async ({
			observatoryId,
			version
		}: {
			observatoryId?: Principal;
			version?: bigint;
		}) => {
			const actor = getActor();

			const { set_automation_config } = actor;

			actor.setIdentity(getController());

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
						observatory_id: toNullable(observatoryId)
					}
				],
				version: toNullable(version)
			};

			await set_automation_config(config);
			await updateRateConfigNoLimit({ actor: observatoryActor });

			actor.setIdentity(identity);
		};

		beforeAll(async () => {
			const pic = getPic();
			const controller = getController();

			const { actor: obsA, canisterId: obsC } = await pic.setupCanister<ObservatoryActor>({
				idlFactory: idlFactoryObservatory,
				wasm: OBSERVATORY_WASM_PATH,
				sender: controller.getPrincipal()
			});

			observatoryActor = obsA;
			observatoryCanisterId = obsC;

			observatoryActor.setIdentity(controller);

			const { start_openid_monitoring } = observatoryActor;
			await start_openid_monitoring(GITHUB_ACTIONS_OPEN_ID_PROVIDER);

			await pic.advanceTime(1000 * 60 * 15); // Observatory refresh every 15min
			await tick(pic);

			const now = await pic.getTime();

			const { jwks, jwt } = await makeMockGoogleOpenIdJwt({
				clientId: mockGoogleClientId,
				date: new Date(now),
				nonce
			});

			// Refresh certificate in Observatory
			await assertOpenIdHttpsOutcalls({ pic, jwks });

			mockJwt = jwt;
		});

		it('should fail if default observatory is targeted', async () => {
			await configTargetObservatory({});

			const { authenticate } = getActor();

			const result = await authenticate({
				OpenId: {
					jwt: mockJwt,
					session_key: publicKey,
					salt
				}
			});

			if ('Ok' in result) {
				expect(true).toBeFalsy();

				return;
			}

			const { Err } = result;

			if (!('PrepareDelegation' in Err)) {
				expect(true).toBeFalsy();

				return;
			}

			const { PrepareDelegation } = Err;

			if (!('GetOrFetchJwks' in PrepareDelegation)) {
				expect(true).toBeFalsy();

				return;
			}

			const { GetOrFetchJwks } = PrepareDelegation;

			if (!('FetchFailed' in GetOrFetchJwks)) {
				expect(true).toBeFalsy();

				return;
			}

			const { FetchFailed } = GetOrFetchJwks;

			expect(FetchFailed).toEqual(
				'Call failed: CallRejected(CallRejected { raw_reject_code: 3, reject_message: "No route to canister klbfr-lqaaa-aaaak-qbwsa-cai" })'
			);
		});

		it('should succeed with custom observatory jwts', async () => {
			await configTargetObservatory({ version: 1n, observatoryId: observatoryCanisterId });

			await getPic().advanceTime(1000 * 30); // 30s for cooldown guard
			await tick(getPic());

			const { authenticate } = getActor();

			const result = await authenticate({
				OpenId: {
					jwt: mockJwt,
					session_key: publicKey,
					salt
				}
			});

			expect('Ok' in result).toBeTruthy();
		});
	});
};
