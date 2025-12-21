import type { ConsoleActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { fromNullable, fromNullishNullable, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import {
	CONSOLE_ID,
	NO_ACCOUNT_ERROR_MSG,
	TEST_FEE
} from '../../../constants/console-tests.constants';
import { setupConsole } from '../../../utils/console-tests.utils';
import { approveIcp, transferIcp } from '../../../utils/ledger-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';

describe('Console > Factory > Mission Control', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let controller: Ed25519KeyIdentity;

	let user: Ed25519KeyIdentity;

	beforeAll(async () => {
		const {
			pic: p,
			actor: c,
			controller: cO
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
	});

	beforeEach(() => {
		user = Ed25519KeyIdentity.generate();
		actor.setIdentity(user);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const createSatelliteWithConsole = async ({ user }: { user: Identity }): Promise<Principal> => {
		const { create_satellite } = actor;

		return await create_satellite({
			user: user.getPrincipal(),
			block_index: toNullable(),
			name: toNullable(),
			storage: toNullable(),
			subnet_id: toNullable()
		});
	};

	const createMissionControlWithConsole = async (): Promise<Principal> => {
		const { create_mission_control } = actor;

		return await create_mission_control({
			subnet_id: toNullable()
		});
	};

	describe('Assertions', () => {
		it('should fail with unknown account', async () => {
			await expect(createMissionControlWithConsole()).rejects.toThrow(NO_ACCOUNT_ERROR_MSG);
		});

		it('should fail if mission control already exists', async () => {
			const { init_user_mission_control_center } = actor;

			await init_user_mission_control_center();

			await expect(createMissionControlWithConsole()).rejects.toThrow(
				'Mission control center already exist.'
			);

			actor.setIdentity(user);
		});
	});

	describe('User', () => {
		it('should create for user', async () => {
			const { get_or_init_account, get_account } = actor;
			await get_or_init_account();

			const id = await createMissionControlWithConsole();

			expect(id).not.toBeUndefined();

			const account = await get_account();

			const missionControlId = fromNullishNullable(fromNullable(account)?.mission_control_id);

			expect(missionControlId).not.toBeUndefined();
		});

		it('should fail with without credits and payment', async () => {
			const { get_or_init_account } = actor;
			await get_or_init_account();

			// Create satellite to use credits
			await createSatelliteWithConsole({ user });

			await pic.advanceTime(60_000);
			await tick(pic);

			// Second requires payment
			await expect(createMissionControlWithConsole()).rejects.toThrow('InsufficientAllowance');
		});

		it('should fail without enough payment', async () => {
			const { get_or_init_account } = actor;
			await get_or_init_account();

			// Create satellite to use credits
			await createSatelliteWithConsole({ user });

			await pic.advanceTime(60_000);
			await tick(pic);

			await transferIcp({
				pic,
				owner: user.getPrincipal()
			});

			await approveIcp({
				pic,
				owner: user,
				spender: CONSOLE_ID,
				amount: TEST_FEE // Fees 10_000n are missing
			});

			await tick(pic);

			// Second requires full payment
			await expect(createMissionControlWithConsole()).rejects.toThrow('InsufficientAllowance');
		});

		it('should succeed with payment', async () => {
			const { get_or_init_account } = actor;
			await get_or_init_account();

			// Create satellite to use credits
			await createSatelliteWithConsole({ user });

			await pic.advanceTime(60_000);
			await tick(pic);

			await transferIcp({
				pic,
				owner: user.getPrincipal()
			});

			await approveIcp({
				pic,
				owner: user,
				spender: CONSOLE_ID,
				amount: TEST_FEE + 10_000n
			});

			await tick(pic);

			// Second uses payment
			const secondId = await createMissionControlWithConsole();

			expect(secondId).not.toBeUndefined();

			const { get_account } = actor;

			const account = await get_account();

			const missionControlId = fromNullishNullable(fromNullable(account)?.mission_control_id);

			expect(missionControlId).not.toBeUndefined();
		});
	});
});
