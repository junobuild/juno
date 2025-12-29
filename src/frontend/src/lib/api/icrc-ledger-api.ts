import { getAgent } from '$lib/api/_agent/_agent.api';
import type { OptionIdentity } from '$lib/types/itentity';
import { assertNonNullish, nowInBigIntNanoSeconds } from '@dfinity/utils';
import {
	IcrcLedgerCanister,
	type ApproveParams,
	type IcrcLedgerDid
} from '@icp-sdk/canisters/ledger/icrc';
import type { Principal } from '@icp-sdk/core/principal';

const ONE_MINUTE = 1n * 60n * 1000n * 1000n * 1000n;

export const approveIcrcTransfer = async ({
	spender,
	amount,
	memo,
	validity = ONE_MINUTE,
	...rest
}: {
	identity: OptionIdentity;
	ledgerId: Principal;
	validity?: bigint;
} & Pick<ApproveParams, 'amount' | 'spender' | 'memo'>): Promise<IcrcLedgerDid.BlockIndex> => {
	const { approve } = await icrcLedgerCanister(rest);

	const request: ApproveParams = {
		spender,
		amount,
		expires_at: nowInBigIntNanoSeconds() + validity,
		memo
	};

	return approve(request);
};

const icrcLedgerCanister = async ({
	identity,
	ledgerId
}: {
	identity: OptionIdentity;
	ledgerId: Principal;
}): Promise<IcrcLedgerCanister> => {
	assertNonNullish(identity, 'No internet identity to initialize the ICRC Ledger actor.');

	const agent = await getAgent({ identity });

	return IcrcLedgerCanister.create({
		agent,
		canisterId: ledgerId
	});
};
