import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import type {
	CyclesMonitoringStrategy,
	_SERVICE as MissionControlActor,
	MonitoringStartConfig
} from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import type { _SERVICE as ObservatoryActor } from '$declarations/observatory/observatory.did';
import { idlFactory as idlFactorObservatory } from '$declarations/observatory/observatory.factory.did';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import type { Principal } from '@dfinity/principal';
import { fromNullable, toNullable } from '@dfinity/utils';
import { type Actor, PocketIc } from '@hadronous/pic';
import { assertNonNullish } from '@junobuild/utils';
import { afterAll, beforeAll, describe, inject } from 'vitest';
import { CONSOLE_ID } from './constants/console-tests.constants';
import { OBSERVATORY_ID } from './constants/observatory-tests.constants';
import { deploySegments, initMissionControls } from './utils/console-tests.utils';
import { setupMissionControlModules } from './utils/mission-control-tests.utils';
import { tick } from './utils/pic-tests.utils';
import { CONSOLE_WASM_PATH, OBSERVATORY_WASM_PATH } from './utils/setup-tests.utils';

describe('Mission Control - Notifications', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	const controller = Ed25519KeyIdentity.generate();

	let observatoryId: Principal;

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactorConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal(),
			targetCanisterId: CONSOLE_ID
		});

		actor = c;
		actor.setIdentity(controller);

		await deploySegments(actor);

		const { canisterId } = await pic.setupCanister<ObservatoryActor>({
			idlFactory: idlFactorObservatory,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal(),
			targetCanisterId: OBSERVATORY_ID
		});

		observatoryId = canisterId;

		await tick(pic);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	it('should notify observatory', { timeout: 600000 }, async () => {
		// Init a mission control
		const [user] = await initMissionControls({ actor, pic, length: 1 });

		actor.setIdentity(user);

		const { get_user_mission_control_center } = actor;
		const missionControl = await get_user_mission_control_center();

		const missionControlId = fromNullable(fromNullable(missionControl)?.mission_control_id ?? []);

		assertNonNullish(missionControlId);

		// Assert no notification have been submitted to the Observatory yet
		const observatoryActor = pic.createActor<ObservatoryActor>(idlFactorObservatory, observatoryId);

		observatoryActor.setIdentity(controller);

		const { get_notify_status } = observatoryActor;

		const status = await get_notify_status({
			segment_id: toNullable(),
			from: toNullable(),
			to: toNullable()
		});

		expect(status).toEqual({
			failed: 0n,
			pending: 0n,
			sent: 0n
		});

		// Spin some modules to monitor
		const missionControlActor = pic.createActor<MissionControlActor>(
			idlFactorMissionControl,
			missionControlId
		);

		missionControlActor.setIdentity(user);

		// We set up a satellite to consumes the cycles from the mission control to top-up the satellite.
		// That way we can write a test without the need of spinning a ledger.
		const { satelliteId } = await setupMissionControlModules({
			pic,
			controller,
			missionControlId
		});

		// Set an email, enable notification, attach the module that was created and start monitoring
		const { update_and_start_monitoring, set_metadata, set_config, set_satellite } =
			missionControlActor;

		await set_metadata([['email', 'test@test.com']]);

		await set_config(
			toNullable({
				monitoring: toNullable({
					cycles: toNullable({
						default_strategy: toNullable(),
						notification: toNullable({
							enabled: true,
							to: toNullable() // We are only using the global email currently but, have foreseen an option
						})
					})
				})
			})
		);

		await set_satellite(satelliteId, []);

		const missionControlCurrentCycles = await pic.getCyclesBalance(missionControlId);
		const satelliteCurrentCycles = await pic.getCyclesBalance(satelliteId);

		const satelliteStrategy: CyclesMonitoringStrategy = {
			BelowThreshold: {
				// This way the satellite already requires cycles
				min_cycles: BigInt(satelliteCurrentCycles) + 100_000_000_000n,
				fund_cycles: 100_000n
			}
		};

		const missionControlStrategy: CyclesMonitoringStrategy = {
			BelowThreshold: {
				// This way the mission control can consume some of its cycles already requires cycles
				min_cycles: BigInt(Math.min(missionControlCurrentCycles - 100_000_000_000, 100_000)),
				fund_cycles: 100_000n
			}
		};

		const config: MonitoringStartConfig = {
			cycles_config: [
				{
					satellites_strategy: toNullable({
						ids: [satelliteId],
						strategy: satelliteStrategy
					}),
					orbiters_strategy: toNullable(),
					mission_control_strategy: toNullable(missionControlStrategy)
				}
			]
		};

		await update_and_start_monitoring(config);

		// One pending notification should be registered in the Observatory
		await vi.waitFor(async () => {
			await pic.tick();

			const statusPending = await get_notify_status({
				segment_id: toNullable(),
				from: toNullable(),
				to: toNullable()
			});

			expect(statusPending).toEqual({
				failed: 0n,
				pending: 1n,
				sent: 0n
			});
		});

		// The notification should fail because no api key for the proxy is registered
		await vi.waitFor(async () => {
			await pic.tick();

			const statusFailed = await get_notify_status({
				segment_id: toNullable(),
				from: toNullable(),
				to: toNullable()
			});

			expect(statusFailed).toEqual({
				failed: 1n,
				pending: 0n,
				sent: 0n
			});
		});
	});
});
