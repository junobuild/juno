import type {
	CyclesMonitoringStrategy,
	_SERVICE as MissionControlActor,
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

		beforeAll(() => {
			actor.setIdentity(controller);
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

		it('should config and start monitoring for satellite', async () => {
			const { update_and_start_monitoring, list_satellites } = actor;

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

			const [[_, satellite]] = await list_satellites();

			const settings = fromNullable(satellite.settings);
			const monitoring = fromNullable(settings?.monitoring ?? []);
			const cycles = fromNullable(monitoring?.cycles ?? []);

			expect(cycles?.enabled).toBeTruthy();
		});

		it('should config and start monitoring for orbiter', async () => {
			const { update_and_start_monitoring, list_orbiters } = actor;

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

			const [[_, orbiter]] = await list_orbiters();

			const settings = fromNullable(orbiter.settings);
			const monitoring = fromNullable(settings?.monitoring ?? []);
			const cycles = fromNullable(monitoring?.cycles ?? []);

			expect(cycles?.enabled).toBeTruthy();
		});
	});
});
