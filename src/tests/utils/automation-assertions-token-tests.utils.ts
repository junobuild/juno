import {
	idlFactoryObservatory,
	type ObservatoryActor,
	type SatelliteActor,
	type SatelliteDid
} from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import {
	JUNO_AUTOMATION_TOKEN_ERROR_MISSING_JTI,
	JUNO_AUTOMATION_TOKEN_ERROR_TOKEN_REUSED
} from '@junobuild/errors';
import { nanoid } from 'nanoid';
import { GITHUB_ACTIONS_OPEN_ID_PROVIDER } from '../constants/auth-tests.constants';
import { OBSERVATORY_ID } from '../constants/observatory-tests.constants';
import { mockRepositoryKey } from '../mocks/automation.mocks';
import { generateNonce } from './auth-nonce-tests.utils';
import { makeMockGitHubActionsOpenIdJwt } from './jwt-tests.utils';
import { assertOpenIdHttpsOutcalls } from './observatory-openid-tests.utils';
import { tick } from './pic-tests.utils';
import { updateRateConfigNoLimit } from './rate.tests.utils';
import { OBSERVATORY_WASM_PATH } from './setup-tests.utils';

export const testAutomationToken = ({
	actor: getActor,
	controller: getController,
	pic: getPic
}: {
	actor: () => Actor<SatelliteActor>;
	controller: () => Ed25519KeyIdentity;
	pic: () => PocketIc;
}) => {
	describe('Token', async () => {
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

		describe('Jti', () => {
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
										repositories: [[mockRepositoryKey, { refs: [] }]],
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

			describe('With Jwts', () => {
				beforeAll(async () => {
					actor.setIdentity(controller);

					const { start_openid_monitoring } = observatoryActor;

					await start_openid_monitoring(GITHUB_ACTIONS_OPEN_ID_PROVIDER);

					actor.setIdentity(automationController);
				});

				it('should fail when jti is missing from JWT', async () => {
					await pic.advanceTime(15 * 60_000);
					await tick(pic);

					const now = await pic.getTime();

					const { jwks, jwt } = await makeMockGitHubActionsOpenIdJwt({
						date: new Date(now),
						nonce,
						jti: null // No jti in the jwt
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

					if (!('SaveUniqueJtiToken' in Err)) {
						expect(true).toBeFalsy();

						return;
					}

					const { SaveUniqueJtiToken } = Err;

					expect(SaveUniqueJtiToken).toEqual(JUNO_AUTOMATION_TOKEN_ERROR_MISSING_JTI);
				});

				it('should fail when jti is reused (replay attack)', async () => {
					await pic.advanceTime(15 * 60_000);
					await tick(pic);

					const now = await pic.getTime();

					const jti = nanoid();

					const { jwks, jwt } = await makeMockGitHubActionsOpenIdJwt({
						date: new Date(now),
						nonce,
						jti
					});

					await assertOpenIdHttpsOutcalls({ pic, jwks, method: 'github_actions' });

					const { authenticate_automation } = actor;

					const result1 = await authenticate_automation({
						OpenId: { jwt, salt }
					});

					expect('Ok' in result1).toBeTruthy();

					// Remove controller to avoid ControllerAlreadyExists checks in next step
					actor.setIdentity(controller);

					const { del_controllers } = actor;
					await del_controllers({ controllers: [automationController.getPrincipal()] });

					actor.setIdentity(automationController);

					// Then try again with same jti
					const result2 = await authenticate_automation({
						OpenId: { jwt, salt }
					});

					if ('Ok' in result2) {
						expect(true).toBeFalsy();

						return;
					}

					const { Err } = result2;

					if (!('SaveUniqueJtiToken' in Err)) {
						expect(true).toBeFalsy();

						return;
					}

					expect(Err.SaveUniqueJtiToken).toEqual(JUNO_AUTOMATION_TOKEN_ERROR_TOKEN_REUSED);
				});
			});
		});
	});
};
