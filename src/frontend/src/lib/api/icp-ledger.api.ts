import { getAgent } from '$lib/api/_agent/_agent.api';
import type { OptionIdentity } from '$lib/types/itentity';
import { assertNonNullish, nowInBigIntNanoSeconds } from '@dfinity/utils';
import {
	LedgerCanister,
	type Icrc1BlockIndex,
	type Icrc2ApproveRequest
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
} & Pick<Icrc2ApproveRequest, 'amount' | 'spender' | 'icrc1Memo'>): Promise<Icrc1BlockIndex> => {
	assertNonNullish(identity, 'No internet identity to initialize the Index actor.');

	const agent = await getAgent({ identity });

	const { icrc2Approve } = LedgerCanister.create({
		agent
	});

	const request: Icrc2ApproveRequest = {
		spender,
		amount,
		expires_at: nowInBigIntNanoSeconds() + validity,
		icrc1Memo
	};

	return icrc2Approve(request);
};
