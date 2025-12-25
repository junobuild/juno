import {
	idlFactoryConsole008,
	type ConsoleActor0014,
	type ConsoleActor008,
	type ConsoleActor015
} from '$declarations';
import { PocketIc, type Actor } from '@dfinity/pic';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import {
	deprecatedInitMissionControls,
	installReleasesWithDeprecatedFlow,
	testSatelliteExists,
	updateRateConfig
} from '../../../utils/console-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';
import { downloadConsole } from '../../../utils/setup-tests.utils';

describe('Console > Upgrade > v0.0.8 -> v0.0.9', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor008>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const destination = await downloadConsole({ junoVersion: '0.0.30', version: '0.0.8' });

		const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor008>({
			idlFactory: idlFactoryConsole008,
			wasm: destination,
			sender: controller.getPrincipal()
		});

		actor = c;
		canisterId = cId;
		actor.setIdentity(controller);

		await installReleasesWithDeprecatedFlow(actor);

		await updateRateConfig({ actor });
	});

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

	const testUsers = async ({
		actor,
		users
	}: {
		users: Identity[];
		actor: Actor<ConsoleActor008 | ConsoleActor0014 | ConsoleActor015>;
	}) => {
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

				const originalUsers = await deprecatedInitMissionControls({ actor, pic, length: 3 });

				actor.setIdentity(controller);

				await testUsers({ users: originalUsers, actor });

				await testSatelliteExists({
					users: originalUsers,
					actor,
					pic
				});

				await upgradeVersion({ junoVersion: '0.0.31', version: '0.0.9' });

				// Moving from 0.0.8 to 0.0.9 we are on purpose deprecating previous ways to hold wasm in memory
				// await testReleases(actor);

				await testUsers({ users: originalUsers, actor });

				await testSatelliteExists({
					users: originalUsers,
					actor,
					pic
				});
			}
		);
	});
});
