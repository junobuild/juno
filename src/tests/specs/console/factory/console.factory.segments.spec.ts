import type { ConsoleActor, ConsoleDid } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { fromNullable, fromNullishNullable, toNullable } from '@dfinity/utils';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import {
	CONSOLE_ID,
	NO_ACCOUNT_ERROR_MSG,
	TEST_FEES
} from '../../../constants/console-tests.constants';
import { CYCLES_LEDGER_ID } from '../../../constants/ledger-tests.contants';
import { setupConsole } from '../../../utils/console-tests.utils';
import { canisterStatus } from '../../../utils/ic-management-tests.utils';
import { approveToken, transferToken } from '../../../utils/ledger-tests.utils';
import { tick } from '../../../utils/pic-tests.utils';

describe('Console > Factory > Segment', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let controller: Ed25519KeyIdentity;

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

	afterAll(async () => {
		await pic?.tearDown();
	});

	const assertMissionControl = async () => {
		const { get_account } = actor;

		const account = await get_account();

		const missionControlId = fromNullishNullable(fromNullable(account)?.mission_control_id);

		expect(missionControlId).not.toBeUndefined();
	};

	const assertSegments = async ({
		title,
		segmentIds
	}: {
		title: string;
		segmentIds: Principal[];
	}) => {
		const { list_segments } = actor;

		const segments = await list_segments({
			segment_kind: [
				title === 'UFO'
					? { Ufo: null }
					: title === 'Orbiter'
						? { Orbiter: null }
						: { Satellite: null }
			],
			segment_id: []
		});

		expect(segments).toHaveLength(segmentIds.length);

		for (const segmentId of segmentIds) {
			expect(
				segments.find(([_, { segment_id }]) => segment_id.toText() === segmentId.toText())
			).not.toBeUndefined();
		}
	};

	const assertController = async ({
		user,
		canisterId,
		controllers
	}: {
		user: Ed25519KeyIdentity;
		canisterId: Principal;
		controllers: Principal[];
	}) => {
		const result = await canisterStatus({
			sender: user,
			pic,
			canisterId
		});

		const settings = result?.settings;

		expect(settings?.controllers).toHaveLength(controllers.length);

		for (const controller of controllers) {
			expect(
				settings?.controllers.find((c) => c.toText() === controller.toText())
			).not.toBeUndefined();
		}
	};

	describe.each([
		{
			title: 'Satellite',
			args: ({ user }: { user: Ed25519KeyIdentity }): ConsoleDid.CreateSegmentArgs => ({
				Satellite: {
					user: user.getPrincipal(),
					block_index: toNullable(),
					name: toNullable(),
					storage: toNullable(),
					subnet_id: toNullable()
				}
			})
		},
		{
			title: 'Orbiter',
			args: ({ user }: { user: Ed25519KeyIdentity }): ConsoleDid.CreateSegmentArgs => ({
				Orbiter: {
					user: user.getPrincipal(),
					block_index: toNullable(),
					name: toNullable(),
					subnet_id: toNullable()
				}
			})
		},
		{
			title: 'UFO',
			args: (_: { user: Ed25519KeyIdentity }): ConsoleDid.CreateSegmentArgs => ({
				Ufo: {
					name: toNullable(),
					subnet_id: toNullable()
				}
			})
		}
	])('$title', ({ title, args }) => {
		let user: Ed25519KeyIdentity;

		beforeEach(() => {
			user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		describe('Assertions', () => {
			it('should fail with unknown account', async () => {
				const { create_segment } = actor;

				await expect(create_segment(args({ user }))).rejects.toThrow(NO_ACCOUNT_ERROR_MSG);
			});
		});

		describe('User', () => {
			it('should create with user', async () => {
				const { get_or_init_account } = actor;
				await get_or_init_account();

				const { create_segment } = actor;

				const id = await create_segment(args({ user }));

				expect(id).not.toBeUndefined();

				await assertSegments({
					title,
					segmentIds: [id]
				});
			});

			it('should create with expected controllers', async () => {
				const { get_or_init_account } = actor;
				await get_or_init_account();

				const { create_segment } = actor;

				const id = await create_segment(args({ user }));

				expect(id).not.toBeUndefined();

				await assertController({
					user,
					canisterId: id,
					controllers: [user.getPrincipal()]
				});
			});

			it('should fail with without credits and payment', async () => {
				const { get_or_init_account, create_segment } = actor;
				await get_or_init_account();

				// First module works out
				await create_segment(args({ user }));

				await pic.advanceTime(60_000);
				await tick(pic);

				// Second requires payment
				await expect(create_segment(args({ user }))).rejects.toThrow('InsufficientAllowance');
			});

			it('should fail without enough payment', async () => {
				const { get_or_init_account, create_segment } = actor;
				await get_or_init_account();

				// First module works out
				await create_segment(args({ user }));

				await pic.advanceTime(60_000);
				await tick(pic);

				await transferToken({
					pic,
					owner: user.getPrincipal(),
					ledgerId: CYCLES_LEDGER_ID,
					amount: 2n * TEST_FEES.fee_cycles.e12s
				});

				await approveToken({
					pic,
					owner: user,
					spender: CONSOLE_ID,
					ledgerId: CYCLES_LEDGER_ID,
					amount: TEST_FEES.fee_cycles.e12s // Fees 100_000_000n are missing
				});

				await tick(pic);

				// Second requires full payment
				await expect(create_segment(args({ user }))).rejects.toThrow('InsufficientAllowance');
			});

			it('should succeed with payment', async () => {
				const { get_or_init_account, create_segment } = actor;
				await get_or_init_account();

				// First module works out
				const firstId = await create_segment(args({ user }));

				await pic.advanceTime(60_000);
				await tick(pic);

				await transferToken({
					pic,
					owner: user.getPrincipal(),
					ledgerId: CYCLES_LEDGER_ID,
					amount: 2n * TEST_FEES.fee_cycles.e12s
				});

				await approveToken({
					pic,
					owner: user,
					spender: CONSOLE_ID,
					ledgerId: CYCLES_LEDGER_ID,
					amount: TEST_FEES.fee_cycles.e12s + 100_000_000n
				});

				await tick(pic);

				// Second uses payment
				const secondId = await create_segment(args({ user }));

				expect(secondId).not.toBeUndefined();

				await assertSegments({
					title,
					segmentIds: [firstId, secondId]
				});
			});
		});
	});

	describe('Mission Control', () => {
		let user: Ed25519KeyIdentity;

		const args: ConsoleDid.CreateSegmentArgs = { MissionControl: { subnet_id: toNullable() } };
		const ufoArgs: ConsoleDid.CreateSegmentArgs = {
			Ufo: { name: toNullable(), subnet_id: toNullable() }
		};

		beforeEach(() => {
			user = Ed25519KeyIdentity.generate();
			actor.setIdentity(user);
		});

		describe('Assertions', () => {
			it('should fail with unknown account', async () => {
				const { create_segment } = actor;

				await expect(create_segment(args)).rejects.toThrow(NO_ACCOUNT_ERROR_MSG);
			});
		});

		describe('User', () => {
			it('should create with user', async () => {
				const { get_or_init_account } = actor;
				await get_or_init_account();

				const { create_segment } = actor;

				const id = await create_segment(args);

				expect(id).not.toBeUndefined();

				await assertMissionControl();
			});

			it('should create with expected controllers', async () => {
				const { get_or_init_account } = actor;
				await get_or_init_account();

				const { create_segment } = actor;

				const id = await create_segment(args);

				expect(id).not.toBeUndefined();

				await assertController({
					user,
					canisterId: id,
					controllers: [user.getPrincipal(), id]
				});
			});

			it('should fail with without credits and payment', async () => {
				const { get_or_init_account, create_segment } = actor;
				await get_or_init_account();

				// First module works out
				await create_segment(ufoArgs);

				await pic.advanceTime(60_000);
				await tick(pic);

				// Second requires payment
				await expect(create_segment(args)).rejects.toThrow('InsufficientAllowance');
			});

			it('should fail without enough payment', async () => {
				const { get_or_init_account, create_segment } = actor;
				await get_or_init_account();

				// First module works out
				await create_segment(ufoArgs);

				await pic.advanceTime(60_000);
				await tick(pic);

				await transferToken({
					pic,
					owner: user.getPrincipal(),
					ledgerId: CYCLES_LEDGER_ID,
					amount: 2n * TEST_FEES.fee_cycles.e12s
				});

				await approveToken({
					pic,
					owner: user,
					spender: CONSOLE_ID,
					ledgerId: CYCLES_LEDGER_ID,
					amount: TEST_FEES.fee_cycles.e12s // Fees 100_000_000n are missing
				});

				await tick(pic);

				// Second requires full payment
				await expect(create_segment(args)).rejects.toThrow('InsufficientAllowance');
			});

			it('should succeed with payment', async () => {
				const { get_or_init_account, create_segment } = actor;
				await get_or_init_account();

				// First module works out
				const firstId = await create_segment(ufoArgs);

				await pic.advanceTime(60_000);
				await tick(pic);

				await transferToken({
					pic,
					owner: user.getPrincipal(),
					ledgerId: CYCLES_LEDGER_ID,
					amount: 2n * TEST_FEES.fee_cycles.e12s
				});

				await approveToken({
					pic,
					owner: user,
					spender: CONSOLE_ID,
					ledgerId: CYCLES_LEDGER_ID,
					amount: TEST_FEES.fee_cycles.e12s + 100_000_000n
				});

				await tick(pic);

				// Second uses payment
				const secondId = await create_segment(args);

				expect(secondId).not.toBeUndefined();

				await assertMissionControl();
			});
		});
	});
});
