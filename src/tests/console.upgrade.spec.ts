import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { PocketIc, type Actor } from '@hadronous/pic';
import { afterEach, beforeEach, describe, expect, inject } from 'vitest';
import { initMissionControls, installReleases } from './utils/console-tests.utils';
import { tick } from './utils/pic-tests.utils';
import { CONSOLE_WASM_PATH, downloadConsole } from './utils/setup-tests.utils';

describe('Console upgrade', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let canisterId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	afterEach(async () => {
		await pic?.tearDown();
	});

	const upgrade = async () => {
		await tick(pic);

		await pic.upgradeCanister({
			canisterId,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});
	};

	describe('v0.0.8 -> v0.0.9', async () => {
		beforeEach(async () => {
			pic = await PocketIc.create(inject('PIC_URL'));

			const destination = await downloadConsole({ junoVersion: '0.0.30', version: '0.0.8' });

			const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor>({
				idlFactory: idlFactorConsole,
				wasm: destination,
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);

			await installReleases(actor);
		});

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
			it('should still list mission controls and payments', async () => {
				const originalUsers = await initMissionControls(actor);

				actor.setIdentity(controller);

				await testUsers(originalUsers);

				await upgrade();

				await testUsers(originalUsers);
			});
		});
	});
});
