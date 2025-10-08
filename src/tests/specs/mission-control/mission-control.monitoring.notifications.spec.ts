import {
	type ConsoleActor,
	type MissionControlActor,
	type ObservatoryActor,
	idlFactoryConsole,
	idlFactoryMissionControl,
	idlFactoryObservatory
} from '$lib/api/actors/actor.factory';
import type { MissionControlDid, ObservatoryDid } from '$lib/types/declarations';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { type Actor, PocketIc } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import { inject } from 'vitest';
import { CONSOLE_ID } from '../../constants/console-tests.constants';
import { OBSERVATORY_ID } from '../../constants/observatory-tests.constants';
import { deploySegments, initMissionControls } from '../../utils/console-tests.utils';
import { setupMissionControlModules } from '../../utils/mission-control-tests.utils';
import {
	assertNotificationHttpsOutcalls,
	DEPOSITED_CYCLES_TEMPLATE_HTML,
	DEPOSITED_CYCLES_TEMPLATE_TEXT,
	FAILED_DEPOSIT_CYCLES_TEMPLATE_HTML,
	FAILED_DEPOSIT_CYCLES_TEMPLATE_TEXT,
	mockObservatoryProxyBearerKey
} from '../../utils/observatory-tests.utils';
import { tick } from '../../utils/pic-tests.utils';
import { CONSOLE_WASM_PATH, OBSERVATORY_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Mission Control > Notifications', () => {
	let pic: PocketIc;

	let consoleActor: Actor<ConsoleActor>;

	const controller = Ed25519KeyIdentity.generate();

	let observatoryActor: Actor<ObservatoryActor>;

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactoryConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal(),
			targetCanisterId: CONSOLE_ID
		});

		await pic.setTime(new Date('2025-05-12T07:53:19+00:00').getTime());

		consoleActor = c;
		consoleActor.setIdentity(controller);

		const { update_rate_config } = consoleActor;

		const config = {
			max_tokens: 1_000n,
			time_per_token_ns: 60_000_000_000n / 1000n // 60ns per token
		};

		await update_rate_config({ Satellite: null }, config);
		await update_rate_config({ MissionControl: null }, config);

		await deploySegments(consoleActor);

		const { actor: oActor } = await pic.setupCanister<ObservatoryActor>({
			idlFactory: idlFactoryObservatory,
			wasm: OBSERVATORY_WASM_PATH,
			sender: controller.getPrincipal(),
			targetCanisterId: OBSERVATORY_ID
		});

		observatoryActor = oActor;

		observatoryActor.setIdentity(controller);

		// The random seed generator init is deferred
		await tick(pic);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const setup = async (): Promise<{
		missionControlId: Principal;
		satelliteId: Principal;
		missionControlActor: Actor<MissionControlActor>;
	}> => {
		// Prevent "Rate limit reached, try again later."
		await pic.advanceTime(100);

		// Init a mission control
		const [user] = await initMissionControls({ actor: consoleActor, pic, length: 1 });

		consoleActor.setIdentity(user);

		const { get_user_mission_control_center } = consoleActor;
		const missionControl = await get_user_mission_control_center();

		const missionControlId = fromNullable(fromNullable(missionControl)?.mission_control_id ?? []);

		assertNonNullish(missionControlId);

		// Spin some modules to monitor
		const missionControlActor = pic.createActor<MissionControlActor>(
			idlFactoryMissionControl,
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

		// Set an email, enable notification, attach the module that was created
		const { set_metadata, set_config, set_satellite } = missionControlActor;

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

		return { missionControlId, satelliteId, missionControlActor };
	};

	const assertObservatoryStatus = async (notifyStatus: ObservatoryDid.NotifyStatus) => {
		const { get_notify_status } = observatoryActor;

		const status = await get_notify_status({
			segment_id: toNullable(),
			from: toNullable(),
			to: toNullable()
		});

		expect(status).toEqual(notifyStatus);
	};

	describe('Deposited cycles', () => {
		let missionControlActor: Actor<MissionControlActor>;

		let satelliteId: Principal;

		let config: MissionControlDid.MonitoringStartConfig;

		beforeEach(async () => {
			const { missionControlId, satelliteId: satId, missionControlActor: mActor } = await setup();

			satelliteId = satId;

			missionControlActor = mActor;

			const missionControlCurrentCycles = await pic.getCyclesBalance(missionControlId);
			const satelliteCurrentCycles = await pic.getCyclesBalance(satelliteId);

			const satelliteStrategy: MissionControlDid.CyclesMonitoringStrategy = {
				BelowThreshold: {
					// This way the satellite already requires cycles
					min_cycles: BigInt(satelliteCurrentCycles) + 100_000_000_000n,
					fund_cycles: 140_000n
				}
			};

			const missionControlStrategy: MissionControlDid.CyclesMonitoringStrategy = {
				BelowThreshold: {
					// This way the mission control can consume some of its cycles already requires cycles
					min_cycles: BigInt(Math.min(missionControlCurrentCycles - 100_000_000_000, 100_000)),
					fund_cycles: 100_000n
				}
			};

			config = {
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
		});

		afterEach(async () => {
			const { update_and_stop_monitoring } = missionControlActor;

			await update_and_stop_monitoring({
				cycles_config: [
					{
						satellite_ids: toNullable([satelliteId]),
						orbiter_ids: toNullable(),
						try_mission_control: toNullable(true)
					}
				]
			});
		});

		describe('Observatory without Email API key', () => {
			beforeEach(async () => {
				const { set_env } = observatoryActor;

				await set_env({
					email_api_key: []
				});
			});

			it(
				'should notify deposited cycles but observatory cannot send notification',
				{ timeout: 600000 },
				async () => {
					await assertObservatoryStatus({
						failed: 0n,
						pending: 0n,
						sent: 0n
					});

					// Start monitoring
					const { update_and_start_monitoring } = missionControlActor;

					await update_and_start_monitoring(config);

					// One pending notification should be registered in the Observatory
					await vi.waitFor(
						async () => {
							await pic.tick();

							await assertObservatoryStatus({
								failed: 0n,
								pending: 1n,
								sent: 0n
							});
						},
						{ timeout: 60000, interval: 200 }
					);

					// The notification should fail because no api key for the proxy is registered
					await vi.waitFor(async () => {
						await pic.tick();

						await assertObservatoryStatus({
							failed: 1n,
							pending: 0n,
							sent: 0n
						});
					});
				}
			);
		});

		describe('Observatory with Email API key', () => {
			beforeEach(async () => {
				const { set_env } = observatoryActor;

				await set_env({
					email_api_key: [mockObservatoryProxyBearerKey]
				});
			});

			it('should notify deposited cycles', { timeout: 600000 }, async () => {
				// Start monitoring
				const { update_and_start_monitoring } = missionControlActor;

				await update_and_start_monitoring(config);

				// One pending notification should be registered in the Observatory
				await vi.waitFor(async () => {
					await pic.tick();

					await assertObservatoryStatus({
						failed: 1n,
						pending: 1n,
						sent: 0n
					});
				});

				await assertNotificationHttpsOutcalls({
					templateText: DEPOSITED_CYCLES_TEMPLATE_TEXT,
					templateHtml: DEPOSITED_CYCLES_TEMPLATE_HTML,
					templateTitle: `🚀 {{cycles}} T Cycles Deposited on Your Satellite`,
					moduleName: 'Satellite',
					url: `https://console.juno.build/satellite/?s=${satelliteId.toText()}`,
					expectedIdempotencyKeySegmentId: satelliteId,
					expectedCycles: '0.00000014',
					pic
				});

				// The notification should have been sent
				await assertObservatoryStatus({
					failed: 1n,
					pending: 0n,
					sent: 1n
				});
			});
		});
	});

	describe('Failed deposit cycles', () => {
		let missionControlActor: Actor<MissionControlActor>;

		let missionControlId: Principal;

		let config: MissionControlDid.MonitoringStartConfig;

		beforeEach(async () => {
			const { missionControlId: mcId, missionControlActor: mActor } = await setup();

			missionControlId = mcId;

			missionControlActor = mActor;

			const missionControlCurrentCycles = await pic.getCyclesBalance(missionControlId);

			const missionControlStrategy: MissionControlDid.CyclesMonitoringStrategy = {
				BelowThreshold: {
					// This way the mission control would need to convert ICP to cycles
					// but given it does not hold ICP, will fail at trying to auto-refill.
					min_cycles: BigInt(missionControlCurrentCycles) + 100_000_000_000n,
					fund_cycles: 100_000n
				}
			};

			config = {
				cycles_config: [
					{
						satellites_strategy: toNullable(),
						orbiters_strategy: toNullable(),
						mission_control_strategy: toNullable(missionControlStrategy)
					}
				]
			};
		});

		afterEach(async () => {
			const { update_and_stop_monitoring } = missionControlActor;

			await update_and_stop_monitoring({
				cycles_config: [
					{
						satellite_ids: toNullable(),
						orbiter_ids: toNullable(),
						try_mission_control: toNullable(true)
					}
				]
			});
		});

		describe('Observatory without Email API key', () => {
			beforeEach(async () => {
				const { set_env } = observatoryActor;

				await set_env({
					email_api_key: []
				});
			});

			it(
				'should notify deposited cycles but observatory cannot send notification',
				{ timeout: 600000 },
				async () => {
					// Flaky in CI
					await vi.waitFor(async () => {
						await pic.tick();

						await assertObservatoryStatus({
							failed: 1n,
							pending: 0n,
							sent: 1n
						});
					});

					// Start monitoring
					const { update_and_start_monitoring } = missionControlActor;

					await update_and_start_monitoring(config);

					// One pending notification should be registered in the Observatory
					await vi.waitFor(async () => {
						await pic.tick();

						await assertObservatoryStatus({
							failed: 1n,
							pending: 1n,
							sent: 1n
						});
					});

					// The notification should fail because no api key for the proxy is registered
					await vi.waitFor(async () => {
						await pic.tick();

						await assertObservatoryStatus({
							failed: 2n,
							pending: 0n,
							sent: 1n
						});
					});
				}
			);
		});

		describe('Observatory with Email API key', () => {
			beforeEach(async () => {
				const { set_env } = observatoryActor;

				await set_env({
					email_api_key: [mockObservatoryProxyBearerKey]
				});
			});

			const assertFailedDepositNotification = async ({
				notifyStatus: { failed, sent },
				expectedTimestamp
			}: {
				notifyStatus: Omit<ObservatoryDid.NotifyStatus, 'pending'>;
				expectedTimestamp?: string;
			}) => {
				// Start monitoring
				const { update_and_start_monitoring } = missionControlActor;

				await update_and_start_monitoring(config);

				// One pending notification should be registered in the Observatory
				await vi.waitFor(
					async () => {
						await pic.tick();

						await assertObservatoryStatus({
							failed,
							pending: 1n,
							sent
						});
					},
					{
						timeout: 60000,
						interval: 200
					}
				);

				await assertNotificationHttpsOutcalls({
					templateText: FAILED_DEPOSIT_CYCLES_TEMPLATE_TEXT,
					templateHtml: FAILED_DEPOSIT_CYCLES_TEMPLATE_HTML,
					templateTitle: `❗️Cycles Deposit Failed on Your Mission Control`,
					moduleName: 'Mission Control',
					url: 'https://console.juno.build/mission-control',
					expectedIdempotencyKeySegmentId: missionControlId,
					expectedTimestamp,
					pic
				});

				// The notification should have been sent
				await assertObservatoryStatus({
					failed,
					pending: 0n,
					sent: sent + 1n
				});
			};

			it('should notify deposited cycles', { timeout: 600000 }, async () => {
				await assertFailedDepositNotification({
					notifyStatus: {
						failed: 2n,
						sent: 1n
					}
				});
			});

			it('should not send failure notification if same day', { timeout: 600000 }, async () => {
				// Config, start and send first failure notification
				await assertFailedDepositNotification({
					notifyStatus: {
						failed: 2n,
						sent: 2n
					}
				});

				const { start_monitoring, stop_monitoring } = missionControlActor;

				// Now stop monitoring.
				await stop_monitoring();

				// Jump in time.
				await pic.advanceTime(1_000 * 60 * 50); // Less than an hour later to avoid dealing with Observatory processing other notifications

				// Start monitoring again
				await start_monitoring();

				// Wait a bit.
				await tick(pic);

				// No new notification should be sent
				await assertObservatoryStatus({
					failed: 2n,
					pending: 0n,
					sent: 3n
				});
			});

			it('should send failure notification if next day', { timeout: 600000 }, async () => {
				// Config, start and send first failure notification
				await assertFailedDepositNotification({
					notifyStatus: {
						failed: 2n,
						sent: 3n
					},
					expectedTimestamp: '2025-05-12T08:43:19+00:00' // We advanced time in previous test
				});

				const { stop_monitoring } = missionControlActor;

				// Now stop monitoring.
				await stop_monitoring();

				// Jump in time.
				await pic.advanceTime(1_000 * 60 * 60 * 24 + 50 * 60 * 1000); // Less than a day and n hour later to avoid dealing with Observatory processing other notifications

				// Should restart monitoring and send failed deposit notification
				await assertFailedDepositNotification({
					notifyStatus: {
						failed: 2n,
						sent: 4n
					},
					expectedTimestamp: '2025-05-13T09:33:19+00:00' // One day and few minutes later
				});
			});
		});
	});
});
