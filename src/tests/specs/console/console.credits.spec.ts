import {
	type ConsoleActor,
	idlFactoryMissionControl,
	type MissionControlActor
} from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { assertNonNullish, fromNullable, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { setupConsole } from '../../utils/console-tests.utils';

describe('Console > Credits', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let controller: Ed25519KeyIdentity;

	beforeAll(async () => {
		const {
			pic: p,
			actor: c,
			controller: cO
		} = await setupConsole({
			withApplyRateTokens: false,
			withLedger: true,
			withSegments: true
		});

		pic = p;

		actor = c;
		actor.setIdentity(controller);

		controller = cO;
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	describe('User', () => {
		let user: Identity;
		let missionControlId: Principal;
		let micActor: Actor<MissionControlActor>;

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

			expect(credits).toEqual({ e8s: 100_000_000n });
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

			expect(credits).toEqual({ e8s: 0n });
		});

		it('should get fees with no more credits', async () => {
			const { get_create_fee } = actor;

			const satFee = await get_create_fee({ Satellite: null });

			expect(satFee).toEqual(toNullable({ e8s: 50_000_000n }));

			const orbFee = await get_create_fee({ Satellite: null });

			expect(orbFee).toEqual(toNullable({ e8s: 50_000_000n }));
		});

		it('should not create a satellite without credits', async () => {
			const { create_satellite } = micActor;

			// No credits -> with payments -> no ICP
			await expect(create_satellite('test')).rejects.toThrow('InsufficientFunds');
		});

		it('should receive credits', async () => {
			actor.setIdentity(controller);

			const { add_credits } = actor;
			await add_credits(user.getPrincipal(), { e8s: 200_000_000n });

			actor.setIdentity(user);

			const { get_credits } = actor;

			const credits = await get_credits();

			expect(credits).toEqual({ e8s: 200_000_000n });
		});

		it('should create a satellite and used some credits', async () => {
			// Advance time to skip: Rate limit reached, try again later.
			await pic.advanceTime(1_000 * 60 * 10);

			const { create_satellite } = micActor;
			const { satellite_id } = await create_satellite('test');

			expect(satellite_id).not.toBeUndefined();

			const { get_credits } = actor;

			const credits = await get_credits();

			expect(credits).toEqual({ e8s: 100_000_000n });
		});
	});
});
