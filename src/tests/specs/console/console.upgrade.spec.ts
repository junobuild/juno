import type { _SERVICE as ConsoleActor_0_0_8 } from '$declarations/deprecated/console-0-0-8-patch1.did';
import { idlFactory as idlFactorConsole_0_0_8 } from '$declarations/deprecated/console-0-0-8-patch1.factory.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { PocketIc, type Actor } from '@hadronous/pic';
import { afterEach, beforeEach, describe, expect, inject } from 'vitest';
import {
	initMissionControls,
	installReleases,
	testSatelliteExists
} from '../../utils/console-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { downloadConsole } from '../../utils/setup-tests.utils';

describe('Console > Upgrade', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor_0_0_8>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	afterEach(async () => {
		await pic?.tearDown();
	});

	const upgradeVersion = async (params: { junoVersion: string; version: string }) => {
		await tick(pic);

		const destination = await downloadConsole(params);

		await pic.upgradeCanister({
			canisterId,
			wasm: destination,
			sender: controller.getPrincipal()
		});
	};

	describe('v0.0.8 -> v0.0.9', () => {
		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadConsole({ junoVersion: '0.0.30', version: '0.0.8' });

			const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor_0_0_8>({
				idlFactory: idlFactorConsole_0_0_8,
				wasm: destination,
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);

			await installReleases(actor);

			await updateRateConfig();
		});

		const updateRateConfig = async () => {
			const { update_rate_config } = actor;

			const config = {
				max_tokens: 100n,
				time_per_token_ns: 60n
			};

			await update_rate_config({ Satellite: null }, config);
			await update_rate_config({ Orbiter: null }, config);
			await update_rate_config({ MissionControl: null }, config);
		};

		const testUsers = async (users: Identity[]) => {
			const { list_user_mission_control_centers } = actor;

			const missionControls = await list_user_mission_control_centers();

			expect(missionControls).toHaveLength(users.length);

			for (const user of users) {
				expect(
					missionControls.find(([key]) => key.toText() === user.getPrincipal().toText())
				).not.toBeUndefined();
			}
		};

		describe('Heap state', () => {
			it(
				'should still list mission controls',
				{
					timeout: 120000
				},
				async () => {
					// We need to advance time for the rate limiter
					await pic.advanceTime(1000);

					const originalUsers = await initMissionControls({ actor, pic, length: 3 });

					actor.setIdentity(controller);

					await testUsers(originalUsers);

					await testSatelliteExists({
						users: originalUsers,
						actor,
						pic
					});

					await upgradeVersion({ junoVersion: '0.0.31', version: '0.0.9' });

					// Moving from 0.0.8 to 0.0.9 we are on purpose deprecating previous ways to hold wasm in memory
					// await testReleases(actor);

					await testUsers(originalUsers);

					await testSatelliteExists({
						users: originalUsers,
						actor,
						pic
					});
				}
			);
		});
	});
});
