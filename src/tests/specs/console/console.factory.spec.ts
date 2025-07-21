import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import { type Identity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { PocketIc, type Actor } from '@dfinity/pic';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable } from '@dfinity/utils';
import { afterEach, beforeEach, describe, inject } from 'vitest';
import { deploySegments } from '../../utils/console-tests.utils';
import { canisterStatus } from '../../utils/ic-management-tests.utils';
import { CONSOLE_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Console', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	const controller = Ed25519KeyIdentity.generate();

	beforeEach(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactorConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal()
		});

		actor = c;
		actor.setIdentity(controller);

		await deploySegments(actor);
	});

	afterEach(async () => {
		await pic?.tearDown();
	});

	describe('User', () => {
		let user: Identity;

		beforeEach(() => {
			user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		it('should create a mission control with expected default settings', async () => {
			const { init_user_mission_control_center } = actor;

			const missionControl = await init_user_mission_control_center();

			const missionControlId = fromNullable(missionControl.mission_control_id);

			assertNonNullish(missionControlId);

			const result = await canisterStatus({
				sender: user,
				pic,
				canisterId: missionControlId
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
					(controller) => controller.toText() === missionControlId.toText()
				)
			).not.toBeUndefined();

			expect(settings?.freezing_threshold).toEqual(2_592_000n);
			expect(settings?.wasm_memory_threshold).toEqual(0n);
			expect(settings?.reserved_cycles_limit).toEqual(5_000_000_000_000n);
			expect(settings?.log_visibility).toEqual({ controllers: null });
			expect(settings?.wasm_memory_limit).toEqual(1_073_741_824n);
			expect(settings?.memory_allocation).toEqual(0n);
			expect(settings?.compute_allocation).toEqual(0n);
		});
	});
});
