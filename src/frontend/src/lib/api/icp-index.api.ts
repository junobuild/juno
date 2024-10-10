import { getAgent } from '$lib/utils/agent.utils';
import { type Identity } from '@dfinity/agent';
import {
	AccountIdentifier,
	IndexCanister,
	type GetAccountIdentifierTransactionsResponse
} from '@dfinity/ledger-icp';
import type { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';

export const getAccountIdentifier = (principal: Principal): AccountIdentifier =>
	AccountIdentifier.fromPrincipal({ principal, subAccount: undefined });

export const getBalance = async ({
	owner,
	identity
}: {
	owner: Principal;
	identity: Identity | undefined | null;
}): Promise<bigint> => {
	if (isNullish(identity)) {
		throw new Error('No internet identity.');
	}

	const agent = await getAgent({ identity });

	const { accountBalance } = IndexCanister.create({
		agent
	});

	return accountBalance({
		accountIdentifier: getAccountIdentifier(owner).toHex()
	});
};

export const getTransactions = async ({
	owner,
	identity,
	start,
	maxResults = 100n
}: {
	owner: Principal;
	identity: Identity | undefined | null;
	start?: bigint;
	maxResults?: bigint;
}): Promise<GetAccountIdentifierTransactionsResponse> => {
	if (isNullish(identity)) {
		throw new Error('No internet identity.');
	}

	const agent = await getAgent({ identity });

	const { getTransactions } = IndexCanister.create({
		agent
	});

	return getTransactions({
		start,
		maxResults,
		accountIdentifier: getAccountIdentifier(owner).toHex()
	});
};
