import { getAgent } from '$lib/api/_agent/_agent.api';
import type { OptionIdentity } from '$lib/types/itentity';
import { assertNonNullish } from '@dfinity/utils';
import {
	type IcrcAccount,
	IcrcIndexCanister,
	type IcrcIndexDid
} from '@icp-sdk/canisters/ledger/icrc';
import type { Principal } from '@icp-sdk/core/principal';

export const getIcrcTransactions = async ({
	account,
	ledgerId,
	identity,
	start,
	maxResults = 100n,
	certified
}: {
	account: IcrcAccount;
	ledgerId: Principal;
	identity: OptionIdentity;
	start?: bigint;
	maxResults?: bigint;
	certified: boolean;
}): Promise<IcrcIndexDid.GetTransactions> => {
	assertNonNullish(identity, 'No internet identity to initialize the ICRC Index actor.');

	const agent = await getAgent({ identity });

	const { getTransactions } = IcrcIndexCanister.create({
		agent,
		canisterId: ledgerId
	});

	return getTransactions({
		account,
		start,
		max_results: maxResults,
		certified
	});
};
