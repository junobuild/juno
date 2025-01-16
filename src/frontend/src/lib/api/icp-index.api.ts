import { getAgent } from '$lib/api/_agent/agent.api';
import type { OptionIdentity } from '$lib/types/itentity';
import {
	AccountIdentifier,
	IndexCanister,
	type GetAccountIdentifierTransactionsResponse
} from '@dfinity/ledger-icp';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish } from '@dfinity/utils';

export const getAccountIdentifier = (principal: Principal): AccountIdentifier =>
	AccountIdentifier.fromPrincipal({ principal, subAccount: undefined });

export const getBalance = async ({
	owner,
	identity
}: {
	owner: Principal;
	identity: OptionIdentity;
}): Promise<bigint> => {
	assertNonNullish(identity, 'No internet identity to initialize the Index actor.');

	const agent = await getAgent({ identity });

	const { accountBalance } = IndexCanister.create({
		agent
	});

	return accountBalance({
		accountIdentifier: getAccountIdentifier(owner).toHex(),
		certified: false
	});
};

export const getTransactions = async ({
	owner,
	identity,
	start,
	maxResults = 100n,
	certified
}: {
	owner: Principal;
	identity: OptionIdentity;
	start?: bigint;
	maxResults?: bigint;
	certified: boolean;
}): Promise<GetAccountIdentifierTransactionsResponse> => {
	assertNonNullish(identity, 'No internet identity to initialize the Index actor.');

	const agent = await getAgent({ identity });

	const { getTransactions } = IndexCanister.create({
		agent
	});

	return getTransactions({
		start,
		maxResults,
		accountIdentifier: getAccountIdentifier(owner).toHex(),
		certified
	});
};
