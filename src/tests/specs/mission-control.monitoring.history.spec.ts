import type {
	CyclesMonitoringStrategy,
	GetMonitoringHistory,
	_SERVICE as MissionControlActor,
	MonitoringHistory,
	MonitoringHistoryKey,
	MonitoringStartConfig
} from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
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

	const MONITORING_INTERVAL_IN_MILLISECONDS = 60 * 60 * 1000;

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

		await tick(pic);
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
	}): Promise<[MonitoringHistoryKey, MonitoringHistory][]> => {
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

			expect(fromNullable(cycles.deposited_cycles)).toBeUndefined();
		});

		return results.sort(
			([{ created_at: aCreatedAt }, _], [{ created_at: bCreateAt }, __]) =>
				Number(aCreatedAt) - Number(bCreateAt)
		);
	};

	describe('init', () => {
		it('should not have monitoring history for mission control', async () => {
			await testEmptyHistory(missionControlId);
		});

		it('should not have monitoring history for satellite', async () => {
			await testEmptyHistory(satelliteId);
		});

		it('should not have monitoring history for orbiter', async () => {
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

		beforeAll(async () => {
			await startMonitoring();
		});

		describe('on start monitoring', () => {
			beforeAll(async () => {
				await tick(pic);
			});

			it('should have monitoring history for mission control', async () => {
				await testHistory({ segmentId: missionControlId, expectedLength: 1 });
			});

			it('should have monitoring history for satellite', async () => {
				await testHistory({ segmentId: satelliteId, expectedLength: 1 });
			});

			it('should have monitoring history for orbiter', async () => {
				await testHistory({ segmentId: orbiterId, expectedLength: 1 });
			});
		});

		describe('collect entries over time', () => {
			describe('first round', () => {
				beforeAll(async () => {
					await pic.advanceTime(MONITORING_INTERVAL_IN_MILLISECONDS);

					await tick(pic);
				});

				it('should have monitoring history for mission control', async () => {
					await testHistory({ segmentId: missionControlId, expectedLength: 2 });
				});

				it('should have monitoring history for satellite', async () => {
					await testHistory({ segmentId: satelliteId, expectedLength: 2 });
				});

				it('should have monitoring history for orbiter', async () => {
					await testHistory({ segmentId: orbiterId, expectedLength: 2 });
				});
			});

			describe('second round', () => {
				beforeAll(async () => {
					await tick(pic);

					await pic.advanceTime(MONITORING_INTERVAL_IN_MILLISECONDS);

					await tick(pic);
				});

				it('should have monitoring history for mission control', async () => {
					await testHistory({ segmentId: missionControlId, expectedLength: 3 });
				});

				it('should have monitoring history for satellite', async () => {
					await testHistory({ segmentId: satelliteId, expectedLength: 3 });
				});

				it('should have monitoring history for orbiter', async () => {
					await testHistory({ segmentId: orbiterId, expectedLength: 3 });
				});
			});
		});

		describe('clean entries older than 30 days', () => {
			let missionControlHistory: [MonitoringHistoryKey, MonitoringHistory][];
			let satelliteHistory: [MonitoringHistoryKey, MonitoringHistory][];
			let orbiterHistory: [MonitoringHistoryKey, MonitoringHistory][];

			const testCleanedHistory = ({
				before,
				after
			}: {
				before: [MonitoringHistoryKey, MonitoringHistory][];
				after: [MonitoringHistoryKey, MonitoringHistory][];
			}) => {
				expect(
					after.find(([key, _]) => key.created_at === before[0][0].created_at)
				).toBeUndefined();

				const [beforeKey1] = before[1];
				const [afterKey0] = after[0];
				expect(beforeKey1.created_at).toEqual(afterKey0.created_at);

				const [beforeKey2] = before[2];
				const [afterKey1] = after[1];
				expect(beforeKey2.created_at).toEqual(afterKey1.created_at);

				expect(
					before.find(([key, _]) => key.created_at === after[after.length - 1][0].created_at)
				).toBeUndefined();
			};

			beforeAll(async () => {
				missionControlHistory = await testHistory({
					segmentId: missionControlId,
					expectedLength: 3
				});
				satelliteHistory = await testHistory({ segmentId: satelliteId, expectedLength: 3 });
				orbiterHistory = await testHistory({ segmentId: orbiterId, expectedLength: 3 });

				const thirtyDays = 1000 * 60 * 60 * 24 * 30;

				// We want to keep the history for the first round and second round but, clean up the start
				await pic.advanceTime(thirtyDays - 2 * MONITORING_INTERVAL_IN_MILLISECONDS);

				await tick(pic);
			});

			it('should have monitoring history for mission control', async () => {
				const updatedHistory = await testHistory({
					segmentId: missionControlId,
					expectedLength: 3
				});

				testCleanedHistory({ before: missionControlHistory, after: updatedHistory });
			});

			it('should have monitoring history for satellite', async () => {
				const updatedHistory = await testHistory({
					segmentId: satelliteId,
					expectedLength: 3
				});

				testCleanedHistory({ before: satelliteHistory, after: updatedHistory });
			});

			it('should have monitoring history for orbiter', async () => {
				const updatedHistory = await testHistory({
					segmentId: orbiterId,
					expectedLength: 3
				});

				testCleanedHistory({ before: orbiterHistory, after: updatedHistory });
			});
		});
	});
});
