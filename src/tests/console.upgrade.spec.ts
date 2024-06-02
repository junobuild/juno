import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { PocketIc, type Actor } from '@hadronous/pic';
import { afterEach, beforeEach, describe, inject } from 'vitest';
import { tick } from './utils/pic-tests.utils';
import { CONSOLE_WASM_PATH, downloadConsole } from './utils/setup-tests.utils';
import type {_SERVICE as OrbiterActor} from "$declarations/orbiter/orbiter.did";
import {idlFactory as idlFactorOrbiter} from "$declarations/orbiter/orbiter.factory.did";

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

			const destination = await downloadConsole('0.0.8');

			const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor>({
				idlFactory: idlFactorConsole,
				wasm: destination,
				sender: controller.getPrincipal()
			});

			actor = c;
			canisterId = cId;
			actor.setIdentity(controller);
		});

		const initMissionControls = async () => {
			const { init_user_mission_control_center } = actor;

			const user = Ed25519KeyIdentity.generate();

			// TODO
		}

        describe('Heap state', () => {
            it('should still list mission controls and payments', async () => {
                const originalKeys = await initMissionControls();

                // TODO test list_user_mission_control_centers

                await upgrade();

                const newActor = pic.createActor<OrbiterActor>(idlFactorOrbiter, canisterId);
                newActor.setIdentity(controller);

                // TODO test list_user_mission_control_centers
            });
        });
	});
});
