import { type MissionControlActor , idlFactoryMissionControl } from '$lib/api/actors/actor.factory';
import type { MissionControlDid } from '$lib/types/declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { toNullable } from '@dfinity/utils';
import { inject } from 'vitest';
import {
	missionControlUserInitArgs,
	setupMissionControlModules
} from '../../utils/mission-control-tests.utils';
import { testMonitoringHistory } from '../../utils/monitoring-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { MISSION_CONTROL_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Mission Control > History', () => {
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
			idlFactory: idlFactoryMissionControl,
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

		const filter: MissionControlDid.GetMonitoringHistory = {
			segment_id: segmentId,
			from: toNullable(),
			to: toNullable()
		};

		const results = await get_monitoring_history(filter);

		expect(results).toHaveLength(0);
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
		const strategy: MissionControlDid.CyclesMonitoringStrategy = {
			BelowThreshold: {
				min_cycles: 500_000n,
				fund_cycles: 100_000n
			}
		};

		const startMonitoring = async () => {
			const { update_and_start_monitoring } = actor;

			const config: MissionControlDid.MonitoringStartConfig = {
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
				await testMonitoringHistory({ segmentId: missionControlId, expectedLength: 1, actor });
			});

			it('should have monitoring history for satellite', async () => {
				await testMonitoringHistory({ segmentId: satelliteId, expectedLength: 1, actor });
			});

			it('should have monitoring history for orbiter', async () => {
				await testMonitoringHistory({ segmentId: orbiterId, expectedLength: 1, actor });
			});
		});

		describe('collect entries over time', () => {
			describe('first round', () => {
				beforeAll(async () => {
					await pic.advanceTime(MONITORING_INTERVAL_IN_MILLISECONDS);

					await tick(pic);
				});

				it('should have monitoring history for mission control', async () => {
					await testMonitoringHistory({ segmentId: missionControlId, expectedLength: 2, actor });
				});

				it('should have monitoring history for satellite', async () => {
					await testMonitoringHistory({ segmentId: satelliteId, expectedLength: 2, actor });
				});

				it('should have monitoring history for orbiter', async () => {
					await testMonitoringHistory({ segmentId: orbiterId, expectedLength: 2, actor });
				});
			});

			describe('second round', () => {
				beforeAll(async () => {
					await tick(pic);

					await pic.advanceTime(MONITORING_INTERVAL_IN_MILLISECONDS);

					await tick(pic);
				});

				it('should have monitoring history for mission control', async () => {
					await testMonitoringHistory({ segmentId: missionControlId, expectedLength: 3, actor });
				});

				it('should have monitoring history for satellite', async () => {
					await testMonitoringHistory({ segmentId: satelliteId, expectedLength: 3, actor });
				});

				it('should have monitoring history for orbiter', async () => {
					await testMonitoringHistory({ segmentId: orbiterId, expectedLength: 3, actor });
				});
			});
		});

		describe('clean entries older than 30 days', () => {
			let missionControlHistory: [
				MissionControlDid.MonitoringHistoryKey,
				MissionControlDid.MonitoringHistory
			][];
			let satelliteHistory: [
				MissionControlDid.MonitoringHistoryKey,
				MissionControlDid.MonitoringHistory
			][];
			let orbiterHistory: [
				MissionControlDid.MonitoringHistoryKey,
				MissionControlDid.MonitoringHistory
			][];

			const testCleanedHistory = ({
				before,
				after
			}: {
				before: [MissionControlDid.MonitoringHistoryKey, MissionControlDid.MonitoringHistory][];
				after: [MissionControlDid.MonitoringHistoryKey, MissionControlDid.MonitoringHistory][];
			}) => {
				expect(
					after.find(([key, _]) => key.created_at === before[0][0].created_at)
				).toBeUndefined();

				// eslint-disable-next-line prefer-destructuring
				const [beforeKey1] = before[1];
				// eslint-disable-next-line prefer-destructuring
				const [afterKey0] = after[0];

				expect(beforeKey1.created_at).toEqual(afterKey0.created_at);

				// eslint-disable-next-line prefer-destructuring
				const [beforeKey2] = before[2];
				// eslint-disable-next-line prefer-destructuring
				const [afterKey1] = after[1];

				expect(beforeKey2.created_at).toEqual(afterKey1.created_at);

				expect(
					before.find(([key, _]) => key.created_at === after[after.length - 1][0].created_at)
				).toBeUndefined();
			};

			beforeAll(async () => {
				missionControlHistory = await testMonitoringHistory({
					segmentId: missionControlId,
					expectedLength: 3,
					actor
				});
				satelliteHistory = await testMonitoringHistory({
					segmentId: satelliteId,
					expectedLength: 3,
					actor
				});
				orbiterHistory = await testMonitoringHistory({
					segmentId: orbiterId,
					expectedLength: 3,
					actor
				});

				const thirtyDays = 1000 * 60 * 60 * 24 * 30;

				// We want to keep the history for the first round and second round but, clean up the start
				await pic.advanceTime(thirtyDays - 2 * MONITORING_INTERVAL_IN_MILLISECONDS);

				await tick(pic);
			});

			it('should have monitoring history for mission control', async () => {
				const updatedHistory = await testMonitoringHistory({
					segmentId: missionControlId,
					expectedLength: 3,
					actor
				});

				testCleanedHistory({ before: missionControlHistory, after: updatedHistory });
			});

			it('should have monitoring history for satellite', async () => {
				const updatedHistory = await testMonitoringHistory({
					segmentId: satelliteId,
					expectedLength: 3,
					actor
				});

				testCleanedHistory({ before: satelliteHistory, after: updatedHistory });
			});

			it('should have monitoring history for orbiter', async () => {
				const updatedHistory = await testMonitoringHistory({
					segmentId: orbiterId,
					expectedLength: 3,
					actor
				});

				testCleanedHistory({ before: orbiterHistory, after: updatedHistory });
			});
		});
	});
});
