import type {
	CyclesMonitoringStrategy,
	_SERVICE as MissionControlActor,
	MonitoringStartConfig,
	MonitoringStopConfig
} from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Principal } from '@dfinity/principal';
import { fromNullable, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { afterEach, beforeEach, describe, expect, inject } from 'vitest';
import {
	missionControlUserInitArgs,
	setupMissionControlModules
} from './utils/mission-control-tests.utils';
import { tick } from './utils/pic-tests.utils';
import { MISSION_CONTROL_WASM_PATH } from './utils/setup-tests.utils';

describe('Mission control upgrade', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	let missionControlId: Principal;
	let orbiterId: Principal;
	let satelliteId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	const strategy: CyclesMonitoringStrategy = {
		BelowThreshold: {
			min_cycles: 500_000n,
			fund_cycles: 100_000n
		}
	};

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const userInitArgs = (): ArrayBuffer => missionControlUserInitArgs(controller.getPrincipal());

		const { actor: c, canisterId: mId } = await pic.setupCanister<MissionControlActor>({
			idlFactory: idlFactorMissionControl,
			wasm: MISSION_CONTROL_WASM_PATH,
			arg: userInitArgs(),
			sender: controller.getPrincipal()
		});

		missionControlId = mId;

		actor = c;

		actor.setIdentity(controller);

		const { orbiterId: oId, satelliteId: sId } = await setupMissionControlModules({
			pic,
			controller,
			missionControlId
		});

		orbiterId = oId;
		satelliteId = sId;

		const { set_orbiter, set_satellite } = actor;

		await set_orbiter(orbiterId, []);
		await set_satellite(satelliteId, []);
	});

	afterEach(async () => {
		await pic?.tearDown();
	});

	it('should restart monitoring after upgrade', async () => {
		const {
			update_and_start_monitoring,
			get_current_monitoring_status,
			update_and_stop_monitoring
		} = actor;

		// 1. Enable monitoring for everything
		const config: MonitoringStartConfig = {
			cycles_config: [
				{
					satellites_strategy: toNullable({
						ids: [satelliteId],
						strategy
					}),
					orbiters_strategy: toNullable({
						ids: [orbiterId],
						strategy
					}),
					mission_control_strategy: toNullable(strategy)
				}
			]
		};

		await update_and_start_monitoring(config);

		// 2. Verify it started
		const { cycles } = await get_current_monitoring_status();

		expect(fromNullable(cycles)?.running === true).toBeTruthy();

		// 3. Stop monitoring for orbiter - that way we can assert that some are started and some not after upgrade
		const stopConfig: MonitoringStopConfig = {
			cycles_config: [
				{
					satellite_ids: toNullable(),
					orbiter_ids: toNullable([orbiterId]),
					try_mission_control: toNullable()
				}
			]
		};

		await update_and_stop_monitoring(stopConfig);

		// 4. Upgrade
		const upgradeCurrent = async () => {
			await tick(pic);

			await pic.upgradeCanister({
				canisterId: missionControlId,
				wasm: MISSION_CONTROL_WASM_PATH,
				sender: controller.getPrincipal()
			});
		};

		await upgradeCurrent();

		// 5. Assert monitoring is running
		await tick(pic);

		const { cycles: newCycles } = await get_current_monitoring_status();

		expect(fromNullable(newCycles)?.running === true).toBeTruthy();

		const monitoredIds = (fromNullable(newCycles)?.monitored_ids ?? []).map((id) => id.toText());

		expect(monitoredIds.includes(missionControlId.toText())).toBeTruthy();
		expect(monitoredIds.includes(satelliteId.toText())).toBeTruthy();
		expect(monitoredIds.includes(orbiterId.toText())).toBeFalsy();
	});
});
