import type {
	CyclesMonitoringStrategy,
	GetMonitoringHistory,
	_SERVICE as MissionControlActor,
	MonitoringStartConfig
} from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { fromNullable, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { assertNonNullish } from '@junobuild/utils';
import { afterAll, beforeAll, describe, inject } from 'vitest';
import {
	missionControlUserInitArgs,
	setupMissionControlModules
} from './utils/mission-control-tests.utils';
import { tick } from './utils/pic-tests.utils';
import { MISSION_CONTROL_WASM_PATH } from './utils/setup-tests.utils';

describe('Mission Control - History', () => {
	let pic: PocketIc;
	let actor: Actor<MissionControlActor>;

	let missionControlId: Principal;
	let orbiterId: Principal;
	let satelliteId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
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

	afterAll(async () => {
		await pic?.tearDown();
	});

	const testEmptyHistory = async (segmentId: Principal) => {
		const { get_monitoring_history } = actor;

		const filter: GetMonitoringHistory = {
			segment_id: segmentId,
			from: toNullable(),
			to: toNullable()
		};

		const results = await get_monitoring_history(filter);

		expect(results.length).toEqual(0);
	};

	const testHistory = async ({
		segmentId,
		expectedLength
	}: {
		segmentId: Principal;
		expectedLength: number;
	}) => {
		const { get_monitoring_history } = actor;

		const filter: GetMonitoringHistory = {
			segment_id: segmentId,
			from: toNullable(),
			to: toNullable()
		};

		const results = await get_monitoring_history(filter);

		expect(results.length).toEqual(expectedLength);

		results.forEach((result) => {
			const [key, history] = result;

			expect(key.segment_id.toText()).toEqual(segmentId.toText());
			expect(key.created_at).toBeGreaterThan(0n);

			const cycles = fromNullable(history.cycles);

			assertNonNullish(cycles);

			expect(cycles.cycles.amount).toBeGreaterThan(0n);
			expect(cycles.cycles.timestamp).toBeGreaterThan(0n);

			expect(fromNullable(cycles.last_deposited_cycles)).toBeUndefined();
		});
	};

	describe('init', () => {
		it('should have not monitoring history for mission control', async () => {
			await testEmptyHistory(missionControlId);
		});

		it('should have not monitoring history for satellite', async () => {
			await testEmptyHistory(satelliteId);
		});

		it('should have not monitoring history for orbiter', async () => {
			await testEmptyHistory(orbiterId);
		});
	});

	describe('with history', () => {
		const strategy: CyclesMonitoringStrategy = {
			BelowThreshold: {
				min_cycles: 500_000n,
				fund_cycles: 100_000n
			}
		};

		const startMonitoring = async () => {
			const { update_and_start_monitoring } = actor;

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
		};

		describe('on start monitoring', () => {
			beforeAll(async () => {
				await startMonitoring();

				await tick(pic);
			});

			it('should have not monitoring history for mission control', async () => {
				await testHistory({ segmentId: missionControlId, expectedLength: 1 });
			});

			it('should have not monitoring history for satellite', async () => {
				await testHistory({ segmentId: satelliteId, expectedLength: 1 });
			});

			it('should have not monitoring history for orbiter', async () => {
				await testHistory({ segmentId: orbiterId, expectedLength: 1 });
			});
		});

		describe('collect entries over time', () => {
			beforeAll(async () => {
				await startMonitoring();

				await tick(pic);

				await pic.advanceTime(30000);

				await tick(pic);
			});

			it('should have not monitoring history for mission control', async () => {
				await testHistory({ segmentId: missionControlId, expectedLength: 2 });
			});

			it('should have not monitoring history for satellite', async () => {
				await testHistory({ segmentId: satelliteId, expectedLength: 2 });
			});

			it('should have not monitoring history for orbiter', async () => {
				await testHistory({ segmentId: orbiterId, expectedLength: 2 });
			});
		});
	});
});
