import { approveIcrcTransfer } from '$lib/api/icrc-ledger.api';
import { CONSOLE_CANISTER_ID, CYCLES_LEDGER_CANISTER_ID, ICP_LEDGER_CANISTER_ID } from '$lib/constants/app.constants';
import { CYCLES_TRANSACTION_FEE, ICP_TRANSACTION_FEE } from '$lib/constants/token.constants';
import { MEMO_CANISTER_APPROVE } from '$lib/constants/wallet.constants';
import type { OptionIdentity } from '$lib/types/itentity';
import type { IcpLedgerDid } from '@icp-sdk/canisters/ledger/icp';
import { Principal } from '@icp-sdk/core/principal';

export const approveCreateCanisterWithCycles = async ({
	identity,
	amount: effectiveAmount
}: {
	identity: OptionIdentity;
	amount: bigint;
}): Promise<void> => {
	const spender: IcpLedgerDid.Account = {
		owner: Principal.fromText(CONSOLE_CANISTER_ID),
		subaccount: []
	};

	const amount = effectiveAmount + CYCLES_TRANSACTION_FEE;

	const icpMemoToIcrc = (memo: bigint): Uint8Array => {
		const buffer = new ArrayBuffer(8);
		const view = new DataView(buffer);
		view.setBigUint64(0, memo, false); // false = big-endian
		return new Uint8Array(buffer);
	};

	await approveIcrcTransfer({
		ledgerId: Principal.fromText(CYCLES_LEDGER_CANISTER_ID),
		identity,
		spender,
		amount,
		memo: icpMemoToIcrc(MEMO_CANISTER_APPROVE)
	});
};

export const approveConvertIcpToCycles = async ({
	identity,
	amount: effectiveAmount
}: {
	identity: OptionIdentity;
	amount: bigint;
}): Promise<void> => {
	const spender: IcpLedgerDid.Account = {
		owner: Principal.fromText(CONSOLE_CANISTER_ID),
		subaccount: []
	};

	const amount = effectiveAmount + ICP_TRANSACTION_FEE;

	await approveIcrcTransfer({
		ledgerId: Principal.fromText(ICP_LEDGER_CANISTER_ID),
		identity,
		spender,
		amount,
		// TODO: memo ?
	});
};
