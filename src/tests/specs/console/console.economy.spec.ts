import type { ConsoleActor } from '$declarations';
import type { Actor, PocketIc } from '@dfinity/pic';
import { toNullable } from '@dfinity/utils';
import type { IcrcLedgerDid } from '@icp-sdk/canisters/ledger/icrc';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import { Ed25519KeyIdentity } from '@icp-sdk/core/identity';
import type { Principal } from '@icp-sdk/core/principal';
import { CONTROLLER_ERROR_MSG } from '../../constants/console-tests.constants';
import { CYCLES_LEDGER_ID } from '../../constants/ledger-tests.contants';
import { setupConsole } from '../../utils/console-tests.utils';
import { balanceToken, transferToken } from '../../utils/ledger-tests.utils';

describe('Console > Economy', () => {
	let pic: PocketIc;
	let actor: Actor<ConsoleActor>;
	let controller: Ed25519KeyIdentity;
	let canisterId: Principal;

	beforeAll(async () => {
		const {
			pic: p,
			actor: c,
			controller: cO,
			canisterId: cId
		} = await setupConsole({
			withApplyRateTokens: false,
			withLedger: true,
			withSegments: false,
			withFee: false
		});

		pic = p;

		controller = cO;
		canisterId = cId;

		actor = c;
		actor.setIdentity(controller);
	});

	afterAll(async () => {
		await pic?.tearDown();
	});

	const assertGuards = () => {
		it('should throw errors on list payments', async () => {
			const { list_icp_payments, list_icrc_payments } = actor;

			await expect(list_icp_payments()).rejects.toThrow(CONTROLLER_ERROR_MSG);
			await expect(list_icrc_payments()).rejects.toThrow(CONTROLLER_ERROR_MSG);
		});

		it('should throw errors on withdraw payments', async () => {
			const { withdraw_icp, withdraw_icrc } = actor;

			await expect(withdraw_icp({ to: controller.getPrincipal() })).rejects.toThrow(
				CONTROLLER_ERROR_MSG
			);
			await expect(withdraw_icrc({ to: controller.getPrincipal() })).rejects.toThrow(
				CONTROLLER_ERROR_MSG
			);
		});
	};

	describe('anonymous', () => {
		beforeEach(() => {
			actor.setIdentity(new AnonymousIdentity());
		});

		assertGuards();
	});

	describe('random', () => {
		const randomCaller = Ed25519KeyIdentity.generate();

		beforeEach(() => {
			actor.setIdentity(randomCaller);
		});

		assertGuards();
	});

	describe('Admin', () => {
		const to = Ed25519KeyIdentity.generate();

		const icpBalance = 600_000_000n;
		const icpFee = 10_000n;

		const cyclesBalance = 50_000_000_000_000n;
		const cyclesFee = 100_000_000n;

		beforeAll(async () => {
			actor.setIdentity(controller);

			await transferToken({
				pic,
				owner: canisterId,
				amount: icpBalance
			});

			await transferToken({
				pic,
				owner: canisterId,
				ledgerId: CYCLES_LEDGER_ID,
				amount: cyclesBalance
			});
		});

		it('should transfer ICP', async () => {
			const { withdraw_icp } = actor;

			const result = await withdraw_icp({
				to: to.getPrincipal()
			});

			expect(result.block_index).toEqual(4n);
			expect(result.amount).toEqual(icpBalance - icpFee);
		});

		it('should transfer ICRC', async () => {
			const { withdraw_icrc } = actor;

			const result = await withdraw_icrc({
				to: to.getPrincipal()
			});

			expect(result.block_index).toEqual(2n);
			expect(result.amount).toEqual(cyclesBalance - cyclesFee);
		});

		it('should have balance after transfers', async () => {
			const consoleAccount: IcrcLedgerDid.Account = {
				owner: canisterId,
				subaccount: toNullable()
			};

			const consoleIcpBalance = await balanceToken({
				pic,
				account: consoleAccount
			});

			expect(consoleIcpBalance).toEqual(0n);

			const consoleCyclesBalance = await balanceToken({
				pic,
				account: consoleAccount,
				ledgerId: CYCLES_LEDGER_ID
			});

			expect(consoleCyclesBalance).toEqual(0n);

			const toAccount: IcrcLedgerDid.Account = {
				owner: to.getPrincipal(),
				subaccount: toNullable()
			};

			const toIcpBalance = await balanceToken({
				pic,
				account: toAccount
			});

			expect(toIcpBalance).toEqual(icpBalance - icpFee);

			const toIcrcBalance = await balanceToken({
				pic,
				account: toAccount,
				ledgerId: CYCLES_LEDGER_ID
			});

			expect(toIcrcBalance).toEqual(cyclesBalance - cyclesFee);
		});
	});
});
