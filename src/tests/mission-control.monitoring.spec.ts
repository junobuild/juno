import type {
	_SERVICE as MissionControlActor,
	MonitoringStopConfig
} from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { PocketIc, type Actor } from '@hadronous/pic';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from './constants/mission-control-tests.constants';
import {
	missionControlUserInitArgs,
	setupMissionControlModules
} from './utils/mission-control-tests.utils';
import { MISSION_CONTROL_WASM_PATH } from './utils/setup-tests.utils';

describe('Mission Control - Monitoring', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	let orbiterId: Principal;
	let satelliteId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const userInitArgs = (): ArrayBuffer => missionControlUserInitArgs(controller.getPrincipal());

		const { actor: c, canisterId: missionControlId } = await pic.setupCanister<MissionControlActor>(
			{
				idlFactory: idlFactorMissionControl,
				wasm: MISSION_CONTROL_WASM_PATH,
				arg: userInitArgs(),
				sender: controller.getPrincipal()
			}
		);

		actor = c;

		actor.setIdentity(controller);

		const { orbiterId: oId, satelliteId: sId } = await setupMissionControlModules({
			pic,
			controller,
			missionControlId
		});

		orbiterId = oId;
		satelliteId = sId;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const testIdentity = () => {
		const emptyConfig: MonitoringStopConfig = {
			cycles_config: []
		};

		it('should throw errors on start monitoring', async () => {
			const { start_monitoring } = actor;

			await expect(start_monitoring()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on stop monitoring', async () => {
			const { stop_monitoring } = actor;

			await expect(stop_monitoring()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on config monitoring', async () => {
			const { update_and_stop_monitoring } = actor;

			await expect(update_and_stop_monitoring(emptyConfig)).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on unset satellite', async () => {
			const { update_and_stop_monitoring } = actor;

			await expect(update_and_stop_monitoring(emptyConfig)).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});
	};

	describe('anonymous', () => {
		beforeAll(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		testIdentity();
	});

	describe('unknown identity', () => {
		beforeAll(() => {
			actor.setIdentity(Ed25519KeyIdentity.generate());
		});

		testIdentity();
	});
});
