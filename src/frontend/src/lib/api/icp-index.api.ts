import { getAgent } from '$lib/api/_agent/_agent.api';
import type { OptionIdentity } from '$lib/types/itentity';
import { toAccountIdentifier } from '$lib/utils/account.utils';
import { assertNonNullish } from '@dfinity/utils';
import { IcpIndexCanister, type IcpIndexDid } from '@icp-sdk/canisters/ledger/icp';
import type { IcrcAccount } from '@icp-sdk/canisters/ledger/icrc';

export const getBalance = async ({
	account,
	identity
}: {
	account: IcrcAccount;
	identity: OptionIdentity;
}): Promise<bigint> => {
	assertNonNullish(identity, 'No internet identity to initialize the Index actor.');

	const agent = await getAgent({ identity });

	const { accountBalance } = IcpIndexCanister.create({
		agent
	});

	return accountBalance({
		accountIdentifier: toAccountIdentifier(account).toHex(),
		certified: false
	});
};

export const getTransactions = async ({
	account,
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
}): Promise<IcpIndexDid.GetAccountIdentifierTransactionsResponse> => {
	assertNonNullish(identity, 'No internet identity to initialize the Index actor.');

	const agent = await getAgent({ identity });

	const { getTransactions } = IcpIndexCanister.create({
		agent
	});

	return getTransactions({
		start,
		maxResults,
		accountIdentifier: toAccountIdentifier(account).toHex(),
		certified
	});
};
