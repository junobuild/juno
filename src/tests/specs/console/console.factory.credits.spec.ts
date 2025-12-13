import {
	type ConsoleActor,
	idlFactoryConsole,
	idlFactoryMissionControl,
	type MissionControlActor
} from '$declarations';
import { type Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { inject } from 'vitest';
import { CONSOLE_ID } from '../../constants/console-tests.constants';
import { deploySegments } from '../../utils/console-tests.utils';
import { CONSOLE_WASM_PATH } from '../../utils/setup-tests.utils';

describe('Console > Factory > Credits', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;

	let consoleId: Principal;

	const controller = Ed25519KeyIdentity.generate();

	beforeAll(async () => {
		pic = await PocketIc.create(inject('PIC_URL'));

		const { actor: c, canisterId: cId } = await pic.setupCanister<ConsoleActor>({
			idlFactory: idlFactoryConsole,
			wasm: CONSOLE_WASM_PATH,
			sender: controller.getPrincipal(),
			targetCanisterId: CONSOLE_ID
		});

		actor = c;
		consoleId = cId;
		actor.setIdentity(controller);

		await deploySegments({ actor });
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('User', () => {
		let user: Identity;
		let missionControlId: Principal;
		let micActor: Actor<MissionControlActor>;

		const addCredits = async () => {
			actor.setIdentity(controller);

			const { add_credits } = actor;
			await add_credits(user.getPrincipal(), { e8s: 100_000_000n });
		};

		beforeAll(async () => {
			user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);

			const { init_user_mission_control_center } = actor;
			const missionControl = await init_user_mission_control_center();

			const mId = fromNullable(missionControl.mission_control_id);

			assertNonNullish(mId);

			missionControlId = mId;

			micActor = pic.createActor<MissionControlActor>(idlFactoryMissionControl, missionControlId);
			micActor.setIdentity(user);
		});

		it('should have remaining credits', async () => {
			const { get_credits } = actor;

			const credits = await get_credits();
			expect(credits).toEqual({e8s: 100_000_000n});
		});

		it('should have zero fee if remaining credits', async () => {
			const { get_create_fee } = actor;

			const fee = await get_create_fee({ Satellite: null });
			expect(fee).toEqual(toNullable());
		});

		it('should create a first satellite and used all credits', async () => {
			const { create_satellite } = micActor;
			const { satellite_id } = await create_satellite('test');

			expect(satellite_id).not.toBeUndefined();

			const { get_credits } = actor;

			const credits = await get_credits();
			expect(credits).toEqual({e8s: 0n});
		});

		it('should get fees with no more credits', async () => {
			const { get_create_fee } = actor;

			const satFee = await get_create_fee({ Satellite: null });
			expect(satFee).toEqual(toNullable({ e8s: 50_000_000n }));

			const orbFee = await get_create_fee({ Satellite: null });
			expect(orbFee).toEqual(toNullable({ e8s: 50_000_000n }));
		});
	});
});
