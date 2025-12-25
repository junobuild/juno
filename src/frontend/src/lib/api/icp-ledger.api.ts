import { getAgent } from '$lib/api/_agent/_agent.api';
import type { OptionIdentity } from '$lib/types/itentity';
import { assertNonNullish, nowInBigIntNanoSeconds } from '@dfinity/utils';
import {
	IcpLedgerCanister,
	type BlockHeight,
	type IcpLedgerDid,
	type Icrc1TransferRequest,
	type Icrc2ApproveRequest,
	type TransferRequest
} from '@icp-sdk/canisters/ledger/icp';

const ONE_MINUTE = 1n * 60n * 1000n * 1000n * 1000n;

export const approveIcpTransfer = async ({
	spender,
	identity,
	amount,
	icrc1Memo,
	validity = ONE_MINUTE
}: {
	identity: OptionIdentity;
	validity?: bigint;
} & Pick<
	Icrc2ApproveRequest,
	'amount' | 'spender' | 'icrc1Memo'
>): Promise<IcpLedgerDid.BlockIndex> => {
	const { icrc2Approve } = await ipcLedgerCanister({ identity });

	const request: Icrc2ApproveRequest = {
		spender,
		amount,
		expires_at: nowInBigIntNanoSeconds() + validity,
		icrc1Memo
	};

	return icrc2Approve(request);
};

export const icpTransfer = async ({
	identity,
	request
}: {
	identity: OptionIdentity;
	request: TransferRequest;
}): Promise<BlockHeight> => {
	const { transfer } = await ipcLedgerCanister({ identity });
	return await transfer(request);
};

export const icrcTransfer = async ({
	identity,
	request
}: {
	identity: OptionIdentity;
	request: Icrc1TransferRequest;
}): Promise<BlockHeight> => {
	const { icrc1Transfer } = await ipcLedgerCanister({ identity });
	return await icrc1Transfer(request);
};

const ipcLedgerCanister = async ({
	identity
}: {
	identity: OptionIdentity;
}): Promise<IcpLedgerCanister> => {
	assertNonNullish(identity, 'No internet identity to initialize the Index actor.');

	const agent = await getAgent({ identity });

	return IcpLedgerCanister.create({
		agent
	});
};
