import {
	idlFactoryMissionControl,
	idlFactoryOrbiter,
	idlFactorySatellite,
	type ConsoleActor,
	type ConsoleDid,
	type MissionControlActor,
	type OrbiterActor,
	type SatelliteActor
} from '$declarations';
import { ONE_YEAR, THREE_MONTHS } from '$lib/constants/canister.constants';
import type { Actor, PocketIc } from '@dfinity/pic';
import {
	assertNonNullish,
	fromNullable,
	fromNullishNullable,
	nonNullish,
	toNullable
} from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { MEMORIES } from '../../../constants/satellite-tests.constants';
import {
	initUserAccountAndMissionControl,
	setupConsole,
	updateRateConfig
} from '../../../utils/console-tests.utils';
import { canisterStatus } from '../../../utils/ic-management-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';

describe('Console > Factory > Settings', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let controller: Ed25519KeyIdentity;

	let consoleId: Principal;

	beforeAll(async () => {
		const {
			pic: p,
			actor: c,
			controller: cO,
			canisterId
		} = await setupConsole({
			withApplyRateTokens: true,
			withLedger: true,
			withSegments: true,
			withFee: true
		});

		pic = p;

		controller = cO;

		actor = c;
		actor.setIdentity(controller);

		consoleId = canisterId;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const assertSettings = async ({
		user,
		canisterId,
		missionControlId,
		freezingThreshold
	}: {
		user: Identity;
		canisterId: Principal;
		missionControlId: Principal;
		freezingThreshold: bigint;
	}) => {
		const result = await canisterStatus({
			sender: user,
			pic,
			canisterId
		});

		const settings = result?.settings;

		expect(settings?.controllers).toHaveLength(2);
		expect(
			settings?.controllers.find(
				(controller) => controller.toText() === user.getPrincipal().toText()
			)
		).not.toBeUndefined();
		expect(
			settings?.controllers.find(
				(controller) =>
					nonNullish(missionControlId) && controller.toText() === missionControlId.toText()
			)
		).not.toBeUndefined();

		expect(settings?.freezing_threshold).toEqual(freezingThreshold);
		expect(settings?.wasm_memory_threshold).toEqual(0n);
		expect(settings?.reserved_cycles_limit).toEqual(5_000_000_000_000n);
		expect(settings?.log_visibility).toEqual({ controllers: null });
		expect(settings?.wasm_memory_limit).toEqual(1_073_741_824n);
		expect(settings?.memory_allocation).toEqual(0n);
		expect(settings?.compute_allocation).toEqual(0n);
	};

	const assertAdminControllers = ({
		user,
		missionControlId,
		controllers
	}: {
		user: Identity;
		missionControlId: Principal;
		controllers: [Principal, ConsoleDid.Controller][];
	}) => {
		const maybeUser = controllers.find(
			([controller]) => controller.toText() === user.getPrincipal().toText()
		);
		assertNonNullish(maybeUser);

		const maybeMic = controllers.find(
			([controller]) =>
				nonNullish(missionControlId) && controller.toText() === missionControlId.toText()
		);
		assertNonNullish(maybeMic);

		expect(maybeUser[1].scope).toEqual({ Admin: null });
		expect(maybeUser[1].metadata).toHaveLength(0);

		expect(maybeMic[1].scope).toEqual({ Admin: null });
		expect(maybeMic[1].metadata).toHaveLength(0);
	};

	const assertControllers = async ({
		user,
		canisterId,
		controllers
	}: {
		user: Identity;
		canisterId: Principal;
		controllers: Principal[];
	}) => {
		const result = await canisterStatus({
			sender: user,
			pic,
			canisterId
		});

		const settings = result?.settings;

		expect(settings?.controllers).toHaveLength(2);

		const maybeConsole = (settings?.controllers ?? []).find(
			(controller) => controller.toText() === consoleId.toText()
		);

		expect(maybeConsole).toBeUndefined();

		for (const controller of controllers) {
			const maybeController = (settings?.controllers ?? []).find(
				(c) => c.toText() === controller.toText()
			);

			expect(maybeController).not.toBeUndefined();
		}
	};

	describe('User', () => {
		let user: Identity;
		let missionControlId: Principal | undefined;

		const addCredits = async () => {
			actor.setIdentity(controller);

			const { add_credits } = actor;
			await add_credits(user.getPrincipal(), { e8s: 100_000_000n });
		};

		beforeAll(async () => {
			const { user: u, missionControlId: mId } = await initUserAccountAndMissionControl({
				pic,
				actor
			});

			user = u;
			missionControlId = mId;
		});

		describe('mission control', () => {
			it('should create a mission control with expected default settings', async () => {
				assertNonNullish(missionControlId);

				await assertSettings({
					user,
					missionControlId,
					canisterId: missionControlId,
					freezingThreshold: BigInt(ONE_YEAR)
				});
			});

			it('should create a mission control with expected controllers', async () => {
				assertNonNullish(missionControlId);

				await assertControllers({
					canisterId: missionControlId,
					user,
					controllers: [missionControlId, user.getPrincipal()]
				});
			});

			it('should create a mission control with no access keys but a user', async () => {
				assertNonNullish(missionControlId);

				const micActor = pic.createActor<MissionControlActor>(
					idlFactoryMissionControl,
					missionControlId
				);
				micActor.setIdentity(user);

				const { list_mission_control_controllers, get_user } = micActor;

				const controllers = await list_mission_control_controllers();

				expect(controllers).toHaveLength(0);

				const micUser = await get_user();

				expect(micUser.toText()).toEqual(user.getPrincipal().toText());
			});
		});

		describe('satellite', () => {
			let satelliteId: Principal;

			beforeAll(async () => {
				actor.setIdentity(controller);

				await updateRateConfig({ actor });
			});

			describe('Settings', () => {
				beforeAll(async () => {
					// We need credits or ICP to spin a satellite as we already spinned a mission control.
					await addCredits();

					assertNonNullish(missionControlId);

					const micActor = pic.createActor<MissionControlActor>(
						idlFactoryMissionControl,
						missionControlId
					);
					micActor.setIdentity(user);

					const { create_satellite } = micActor;
					const { satellite_id } = await create_satellite('test');

					satelliteId = satellite_id;
				});

				it('should create a satellite with expected default settings', async () => {
					assertNonNullish(missionControlId);

					await assertSettings({
						user,
						missionControlId,
						canisterId: satelliteId,
						freezingThreshold: BigInt(ONE_YEAR)
					});
				});

				it('should create a satellite with expected controllers', async () => {
					assertNonNullish(missionControlId);

					await assertControllers({
						canisterId: satelliteId,
						user,
						controllers: [missionControlId, user.getPrincipal()]
					});
				});

				it('should create a satellite with expected access keys', async () => {
					assertNonNullish(satelliteId);
					assertNonNullish(missionControlId);

					const satActor = pic.createActor<SatelliteActor>(idlFactorySatellite, satelliteId);
					satActor.setIdentity(user);

					const { list_controllers } = satActor;

					const controllers = await list_controllers();

					expect(controllers).toHaveLength(2);

					assertAdminControllers({
						controllers,
						missionControlId,
						user
					});
				});
			});

			describe.each([{ title: 'Heap (default)', memory: null }, ...MEMORIES])(
				'$title',
				({ memory, title }) => {
					beforeAll(async () => {
						// We need credits or ICP to spin another satellite.
						await addCredits();

						assertNonNullish(missionControlId);

						const micActor = pic.createActor<MissionControlActor>(
							idlFactoryMissionControl,
							missionControlId
						);
						micActor.setIdentity(user);

						await tick(pic);

						const { create_satellite_with_config } = micActor;
						const { satellite_id } = await create_satellite_with_config({
							name: toNullable(title),
							subnet_id: toNullable(),
							storage: toNullable(
								nonNullish(memory)
									? {
											system_memory: toNullable(memory)
										}
									: undefined
							)
						});

						satelliteId = satellite_id;
					});

					it('should create satellite with expected memory', async () => {
						const satActor = pic.createActor<SatelliteActor>(idlFactorySatellite, satelliteId);
						satActor.setIdentity(user);

						const { get_rule } = satActor;

						const DAPP_COLLECTION = '#dapp';
						const RELEASES_COLLECTION = '#_juno/releases';

						for (const collection of [DAPP_COLLECTION, RELEASES_COLLECTION]) {
							const result = fromNullable(await get_rule({ Storage: null }, collection));

							const ruleMemory = fromNullishNullable(result?.memory);

							expect(ruleMemory).toEqual(memory ?? { Heap: null });
						}
					});

					it('should have given specified name to satellite in mission control', async () => {
						assertNonNullish(missionControlId);

						const micActor = pic.createActor<MissionControlActor>(
							idlFactoryMissionControl,
							missionControlId
						);
						micActor.setIdentity(user);

						const { list_satellites } = micActor;

						const satellites = await list_satellites();

						const satellite = satellites.find(([id]) => id.toText() === satelliteId.toText());

						assertNonNullish(satellite);

						const [_, satName] = satellite[1].metadata.find(([key]) => key === 'name') ?? [];

						expect(satName).toEqual(title);
					});
				}
			);
		});

		describe('orbiter', () => {
			let orbiterId: Principal | undefined;

			beforeAll(async () => {
				// First we need credits or ICP to spin another module. Let's use the former method.
				await addCredits();

				// Then we can create the additional module
				assertNonNullish(missionControlId);

				const micActor = pic.createActor<MissionControlActor>(
					idlFactoryMissionControl,
					missionControlId
				);
				micActor.setIdentity(user);

				const { create_orbiter } = micActor;
				const { orbiter_id } = await create_orbiter([]);

				orbiterId = orbiter_id;
			});

			it('should create an orbiter with expected default settings', async () => {
				assertNonNullish(missionControlId);
				assertNonNullish(orbiterId);

				await assertSettings({
					user,
					missionControlId,
					canisterId: orbiterId,
					freezingThreshold: BigInt(THREE_MONTHS)
				});
			});

			it('should create a satellite with expected controllers', async () => {
				assertNonNullish(missionControlId);
				assertNonNullish(orbiterId);

				await assertControllers({
					canisterId: orbiterId,
					user,
					controllers: [missionControlId, user.getPrincipal()]
				});
			});

			it('should create an orbiter with expected access keys', async () => {
				assertNonNullish(orbiterId);
				assertNonNullish(missionControlId);

				const orbActor = pic.createActor<OrbiterActor>(idlFactoryOrbiter, orbiterId);
				orbActor.setIdentity(user);

				const { list_controllers } = orbActor;

				const controllers = await list_controllers();

				expect(controllers).toHaveLength(2);

				assertAdminControllers({
					controllers,
					missionControlId,
					user
				});
			});
		});
	});
});
