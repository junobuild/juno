import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import { ONE_YEAR, THREE_MONTHS } from '$lib/constants/canister.constants';
import type { Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, nonNullish } from '@dfinity/utils';
import { inject } from 'vitest';
import { CONSOLE_ID } from '../../constants/console-tests.constants';
import { deploySegments } from '../../utils/console-tests.utils';
import { canisterStatus } from '../../utils/ic-management-tests.utils';
import { CONSOLE_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Console', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	const controller = Ed25519KeyIdentity.generate();

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

	describe('User', () => {
		let user: Identity;
		let missionControlId: Principal | undefined;

		beforeAll(() => {
			user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		it('should create a mission control with expected default settings', async () => {
			const { init_user_mission_control_center } = actor;

			const missionControl = await init_user_mission_control_center();

			missionControlId = fromNullable(missionControl.mission_control_id);
			assertNonNullish(missionControlId);

			await assertSettings({
				user,
				missionControlId,
				canisterId: missionControlId,
				freezingThreshold: BigInt(ONE_YEAR)
			});
		});

		it('should create a satellite with expected default settings', async () => {
			assertNonNullish(missionControlId);

			const micActor = pic.createActor<MissionControlActor>(
				idlFactorMissionControl,
				missionControlId
			);
			micActor.setIdentity(user);

			const { create_satellite } = micActor;
			const { satellite_id: satelliteId } = await create_satellite('test');

			await assertSettings({
				user,
				missionControlId,
				canisterId: satelliteId,
				freezingThreshold: BigInt(ONE_YEAR)
			});
		});

		it('should create an orbiter with expected default settings', async () => {
			// First we need credits or ICP to spin another module. Let's use the former method.
			actor.setIdentity(controller);

			const { add_credits } = actor;
			await add_credits(user.getPrincipal(), { e8s: 100_000_000n });

			// Then we can create the additional module
			assertNonNullish(missionControlId);

			const micActor = pic.createActor<MissionControlActor>(
				idlFactorMissionControl,
				missionControlId
			);
			micActor.setIdentity(user);

			const { create_orbiter } = micActor;
			const { orbiter_id: orbiterId } = await create_orbiter([]);

			await assertSettings({
				user,
				missionControlId,
				canisterId: orbiterId,
				freezingThreshold: BigInt(THREE_MONTHS)
			});
		});
	});
});
