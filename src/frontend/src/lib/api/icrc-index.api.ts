import { getAgent } from '$lib/api/_agent/_agent.api';
import type { LedgerIds } from '$lib/schemas/wallet.schema';
import type { OptionIdentity } from '$lib/types/itentity';
import { assertNonNullish } from '@dfinity/utils';
import {
	type IcrcAccount,
	IcrcIndexCanister,
	type IcrcIndexDid
} from '@icp-sdk/canisters/ledger/icrc';

export const getUncertifiedBalance = async ({
	account,
	identity,
	indexId
}: {
	account: IcrcAccount;
	identity: OptionIdentity;
} & Pick<LedgerIds, 'indexId'>): Promise<bigint> => {
	assertNonNullish(identity, 'No internet identity to initialize the ICRC Index actor.');

	const agent = await getAgent({ identity });

	const { balance } = IcrcIndexCanister.create({
		agent,
		canisterId: indexId
	});

	return balance({
		...account,
		certified: false
	});
};

export const getIcrcTransactions = async ({
	account,
	indexId,
	identity,
	start,
	maxResults = 100n,
	certified
}: {
	account: IcrcAccount;
	identity: OptionIdentity;
	start?: bigint;
	maxResults?: bigint;
	certified: boolean;
} & Pick<LedgerIds, 'indexId'>): Promise<IcrcIndexDid.GetTransactions> => {
	assertNonNullish(identity, 'No internet identity to initialize the ICRC Index actor.');

	const agent = await getAgent({ identity });

	const { getTransactions } = IcrcIndexCanister.create({
		agent,
		canisterId: indexId
	});

	return getTransactions({
		account,
		start,
		max_results: maxResults,
		certified
	});
};
