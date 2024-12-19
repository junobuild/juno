import type {
	CyclesMonitoringStrategy,
	_SERVICE as MissionControlActor,
	Monitoring,
	MonitoringStartConfig,
	MonitoringStopConfig
} from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import { AnonymousIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { fromNullable, nonNullish, toNullable } from '@dfinity/utils';
import { PocketIc, type Actor } from '@hadronous/pic';
import { afterAll, beforeAll, describe, expect, inject } from 'vitest';
import { CONTROLLER_ERROR_MSG } from './constants/mission-control-tests.constants';
import { satelliteIdMock } from './mocks/orbiter.mocks';
import {
	missionControlUserInitArgs,
	setupMissionControlModules
} from './utils/mission-control-tests.utils';
import { MISSION_CONTROL_WASM_PATH } from './utils/setup-tests.utils';

describe('Mission Control - Monitoring', () => {
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

		it('should throw errors on get monitoring status', async () => {
			const { get_monitoring_status } = actor;

			await expect(get_monitoring_status()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on get monitoring history', async () => {
			const { get_monitoring_history } = actor;

			await expect(
				get_monitoring_history({
					segment_id: satelliteId,
					from: toNullable(),
					to: toNullable()
				})
			).rejects.toThrow(CONTROLLER_ERROR_MSG);
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

	describe('admin', () => {
		const strategy: CyclesMonitoringStrategy = {
			BelowThreshold: {
				min_cycles: 500_000n,
				fund_cycles: 100_000n
			}
		};

		const updateStrategy: CyclesMonitoringStrategy = {
			BelowThreshold: {
				min_cycles: 800_000n,
				fund_cycles: 300_000n
			}
		};

		beforeAll(() => {
			actor.setIdentity(controller);
		});

		it('should have no monitoring status', async () => {
			const { get_monitoring_status } = actor;

			const { cycles } = await get_monitoring_status();

			expect(fromNullable(cycles)).toBeUndefined();
		});

		it('should have no mission control settings', async () => {
			const { get_settings } = actor;

			const results = await get_settings();

			expect(fromNullable(results)).toBeUndefined();
		});

		it('should have no satellites settings', async () => {
			const { list_satellites } = actor;

			const results = await list_satellites();

			expect(
				results.find(([_, { settings }]) => nonNullish(fromNullable(settings)))
			).toBeUndefined();
		});

		it('should have no orbiters settings', async () => {
			const { list_orbiters } = actor;

			const results = await list_orbiters();

			expect(
				results.find(([_, { settings }]) => nonNullish(fromNullable(settings)))
			).toBeUndefined();
		});

		it('should fail at configuring monitoring if mission control is not already monitored', async () => {
			const { update_and_start_monitoring } = actor;

			const config: MonitoringStartConfig = {
				cycles_config: [
					{
						satellites_strategy: toNullable({
							ids: [satelliteId],
							strategy
						}),
						orbiters_strategy: toNullable(),
						mission_control_strategy: toNullable()
					}
				]
			};

			await expect(update_and_start_monitoring(config)).rejects.toThrow(
				'A strategy for monitoring the missing mission control must be provided.'
			);
		});

		const testMonitoring = ({
			monitoring,
			expectedEnabled,
			expectedStrategy = strategy
		}: {
			monitoring: Monitoring | undefined;
			expectedEnabled: boolean;
			expectedStrategy?: CyclesMonitoringStrategy;
		}) => {
			const cycles = fromNullable(monitoring?.cycles ?? []);
			const cyclesStrategy = fromNullable(cycles?.strategy ?? []);

			expect(cycles?.enabled).toBe(expectedEnabled);
			expect(cyclesStrategy?.BelowThreshold.fund_cycles).toEqual(
				expectedStrategy.BelowThreshold.fund_cycles
			);
			expect(cyclesStrategy?.BelowThreshold.min_cycles).toEqual(
				expectedStrategy.BelowThreshold.min_cycles
			);
		};

		const testMissionControlMonitoring = async ({
			expectedEnabled,
			expectedStrategy
		}: {
			expectedEnabled: boolean;
			expectedStrategy?: CyclesMonitoringStrategy;
		}) => {
			const { get_settings } = actor;

			const settings = fromNullable(await get_settings());
			const monitoring = fromNullable(settings?.monitoring ?? []);

			testMonitoring({ monitoring, expectedEnabled, expectedStrategy });
		};

		const testSatellitesMonitoring = async ({
			expectedEnabled,
			expectedStrategy
		}: {
			expectedEnabled: boolean;
			expectedStrategy?: CyclesMonitoringStrategy;
		}) => {
			const { list_satellites } = actor;

			const [[_, satellite]] = await list_satellites();

			const settings = fromNullable(satellite.settings);
			const monitoring = fromNullable(settings?.monitoring ?? []);

			testMonitoring({ monitoring, expectedEnabled, expectedStrategy });
		};

		const testOrbiterMonitoring = async ({
			expectedEnabled,
			expectedStrategy
		}: {
			expectedEnabled: boolean;
			expectedStrategy?: CyclesMonitoringStrategy;
		}) => {
			const { list_orbiters } = actor;

			const [[_, orbiter]] = await list_orbiters();

			const settings = fromNullable(orbiter.settings);
			const monitoring = fromNullable(settings?.monitoring ?? []);

			testMonitoring({ monitoring, expectedEnabled, expectedStrategy });
		};

		it('should config and start monitoring for mission control', async () => {
			const { update_and_start_monitoring } = actor;

			const config: MonitoringStartConfig = {
				cycles_config: [
					{
						satellites_strategy: toNullable(),
						orbiters_strategy: toNullable(),
						mission_control_strategy: toNullable(strategy)
					}
				]
			};

			await update_and_start_monitoring(config);

			await testMissionControlMonitoring({ expectedEnabled: true });
		});

		it('should have a running monitoring status', async () => {
			const { get_monitoring_status } = actor;

			const { cycles } = await get_monitoring_status();

			expect(fromNullable(cycles)?.running === true).toBeTruthy();
		});

		it('should config and start monitoring for satellite', async () => {
			const { update_and_start_monitoring } = actor;

			const config: MonitoringStartConfig = {
				cycles_config: [
					{
						satellites_strategy: toNullable({
							ids: [satelliteId],
							strategy
						}),
						orbiters_strategy: toNullable(),
						mission_control_strategy: toNullable()
					}
				]
			};

			await update_and_start_monitoring(config);

			await testSatellitesMonitoring({ expectedEnabled: true });
		});

		it('should config and start monitoring for orbiter', async () => {
			const { update_and_start_monitoring } = actor;

			const config: MonitoringStartConfig = {
				cycles_config: [
					{
						satellites_strategy: toNullable(),
						orbiters_strategy: toNullable({
							ids: [orbiterId],
							strategy
						}),
						mission_control_strategy: toNullable()
					}
				]
			};

			await update_and_start_monitoring(config);

			await testOrbiterMonitoring({ expectedEnabled: true });
		});

		it('should fail at configuring monitoring for unknown satellite', async () => {
			const { update_and_start_monitoring } = actor;

			const config: MonitoringStartConfig = {
				cycles_config: [
					{
						satellites_strategy: toNullable({
							ids: [satelliteIdMock],
							strategy
						}),
						orbiters_strategy: toNullable(),
						mission_control_strategy: toNullable()
					}
				]
			};

			await expect(update_and_start_monitoring(config)).rejects.toThrow(
				`Satellite ${satelliteIdMock.toText()} not found. Strategy cannot be saved.`
			);
		});

		it('should fail at configuring monitoring for unknown orbiter', async () => {
			const { update_and_start_monitoring } = actor;

			const config: MonitoringStartConfig = {
				cycles_config: [
					{
						satellites_strategy: toNullable(),
						orbiters_strategy: toNullable({
							ids: [satelliteId],
							strategy
						}),
						mission_control_strategy: toNullable()
					}
				]
			};

			await expect(update_and_start_monitoring(config)).rejects.toThrow(
				`Orbiter ${satelliteId.toText()} not found. Strategy cannot be saved.`
			);
		});

		it('should fail at stopping monitoring for unknown satellite', async () => {
			const { update_and_stop_monitoring } = actor;

			const config: MonitoringStopConfig = {
				cycles_config: [
					{
						satellite_ids: toNullable([satelliteIdMock]),
						orbiter_ids: toNullable(),
						try_mission_control: toNullable()
					}
				]
			};

			await expect(update_and_stop_monitoring(config)).rejects.toThrow(
				`Satellite ${satelliteIdMock.toText()} not found. Monitoring cannot be disabled.`
			);
		});

		it('should fail at stopping monitoring for unknown orbiter', async () => {
			const { update_and_stop_monitoring } = actor;

			const config: MonitoringStopConfig = {
				cycles_config: [
					{
						satellite_ids: toNullable(),
						orbiter_ids: toNullable([satelliteId]),
						try_mission_control: toNullable()
					}
				]
			};

			await expect(update_and_stop_monitoring(config)).rejects.toThrow(
				`Orbiter ${satelliteId.toText()} not found. Monitoring cannot be disabled.`
			);
		});

		it('should fail at stopping monitoring for mission control if modules are still being monitored', async () => {
			const { update_and_stop_monitoring } = actor;

			const config: MonitoringStopConfig = {
				cycles_config: [
					{
						satellite_ids: toNullable(),
						orbiter_ids: toNullable(),
						try_mission_control: toNullable(true)
					}
				]
			};

			await expect(update_and_stop_monitoring(config)).rejects.toThrow(
				'Mission control monitoring cannot be disabled while some modules remain active.'
			);
		});

		it('should stop monitoring for satellite', async () => {
			const { update_and_stop_monitoring } = actor;

			const config: MonitoringStopConfig = {
				cycles_config: [
					{
						satellite_ids: toNullable([satelliteId]),
						orbiter_ids: toNullable(),
						try_mission_control: toNullable()
					}
				]
			};

			await update_and_stop_monitoring(config);

			await testSatellitesMonitoring({ expectedEnabled: false });
			await testOrbiterMonitoring({ expectedEnabled: true });
		});

		it('should stop monitoring for orbiter', async () => {
			const { update_and_stop_monitoring } = actor;

			const config: MonitoringStopConfig = {
				cycles_config: [
					{
						satellite_ids: toNullable(),
						orbiter_ids: toNullable([orbiterId]),
						try_mission_control: toNullable()
					}
				]
			};

			await update_and_stop_monitoring(config);

			await testSatellitesMonitoring({ expectedEnabled: false });
			await testOrbiterMonitoring({ expectedEnabled: false });
		});

		it('should stop monitoring for mission control', async () => {
			const { update_and_stop_monitoring } = actor;

			const config: MonitoringStopConfig = {
				cycles_config: [
					{
						satellite_ids: toNullable(),
						orbiter_ids: toNullable(),
						try_mission_control: toNullable(true)
					}
				]
			};

			await update_and_stop_monitoring(config);

			await testMissionControlMonitoring({ expectedEnabled: false });

			await testSatellitesMonitoring({ expectedEnabled: false });
			await testOrbiterMonitoring({ expectedEnabled: false });
		});

		it('should have a stopped monitoring status', async () => {
			const { get_monitoring_status } = actor;

			const { cycles } = await get_monitoring_status();

			expect(fromNullable(cycles)?.running === false).toBeTruthy();
		});

		it('should start monitoring', async () => {
			const { start_monitoring } = actor;

			await start_monitoring();

			await testMissionControlMonitoring({ expectedEnabled: true });
			await testSatellitesMonitoring({ expectedEnabled: true });
			await testOrbiterMonitoring({ expectedEnabled: true });
		});

		it('should have a running monitoring status', async () => {
			const { get_monitoring_status } = actor;

			const { cycles } = await get_monitoring_status();

			expect(fromNullable(cycles)?.running === true).toBeTruthy();
		});

		it('should stop monitoring', async () => {
			const { stop_monitoring } = actor;

			await stop_monitoring();

			await testMissionControlMonitoring({ expectedEnabled: false });
			await testSatellitesMonitoring({ expectedEnabled: false });
			await testOrbiterMonitoring({ expectedEnabled: false });
		});

		it('should have a stopped monitoring status', async () => {
			const { get_monitoring_status } = actor;

			const { cycles } = await get_monitoring_status();

			expect(fromNullable(cycles)?.running === false).toBeTruthy();
		});

		it('should update config for mission control', async () => {
			const { update_and_start_monitoring } = actor;

			const config: MonitoringStartConfig = {
				cycles_config: [
					{
						satellites_strategy: toNullable(),
						orbiters_strategy: toNullable(),
						mission_control_strategy: toNullable(updateStrategy)
					}
				]
			};

			await update_and_start_monitoring(config);

			await testMissionControlMonitoring({
				expectedEnabled: true,
				expectedStrategy: updateStrategy
			});
		});

		it('should update config for satellite', async () => {
			const { update_and_start_monitoring } = actor;

			const config: MonitoringStartConfig = {
				cycles_config: [
					{
						satellites_strategy: toNullable({
							ids: [satelliteId],
							strategy: updateStrategy
						}),
						orbiters_strategy: toNullable(),
						mission_control_strategy: toNullable()
					}
				]
			};

			await update_and_start_monitoring(config);

			await testSatellitesMonitoring({ expectedEnabled: true, expectedStrategy: updateStrategy });
		});

		it('should update config for orbiter', async () => {
			const { update_and_start_monitoring } = actor;

			const config: MonitoringStartConfig = {
				cycles_config: [
					{
						satellites_strategy: toNullable(),
						orbiters_strategy: toNullable({
							ids: [orbiterId],
							strategy: updateStrategy
						}),
						mission_control_strategy: toNullable()
					}
				]
			};

			await update_and_start_monitoring(config);

			await testOrbiterMonitoring({ expectedEnabled: true, expectedStrategy: updateStrategy });
		});
	});
});
