import { approveIcpTransfer } from '$lib/api/icp-ledger.api';
import { CONSOLE_CANISTER_ID, IC_TRANSACTION_FEE_ICP } from '$lib/constants/app.constants';
import { MEMO_CANISTER_CREATE } from '$lib/constants/wallet.constants';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Account } from '@icp-sdk/canisters/ledger/icp';
import { Principal } from '@icp-sdk/core/principal';

export const approveCreateCanisterWithIcp = async ({
	identity,
	amount: effectiveAmount
}: {
	identity: OptionIdentity;
	amount: bigint;
}): Promise<void> => {
	const spender: Account = {
		owner: Principal.fromText(CONSOLE_CANISTER_ID),
		subaccount: []
	};

	const amount = effectiveAmount + IC_TRANSACTION_FEE_ICP;

	const icpMemoToIcrc = (memo: bigint): Uint8Array => {
		const buffer = new ArrayBuffer(8);
		const view = new DataView(buffer);
		view.setBigUint64(0, memo, false); // false = big-endian
		return new Uint8Array(buffer);
	};

	await approveIcpTransfer({
		identity,
		spender,
		amount,
		icrc1Memo: icpMemoToIcrc(MEMO_CANISTER_CREATE)
	});
};
