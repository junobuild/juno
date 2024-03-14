import { container } from '$lib/utils/juno.utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';
import type { GetAccountIdentifierTransactionsResponse } from '@junobuild/ledger';
import { AccountIdentifier, balance, transactions } from '@junobuild/ledger';

export const getAccountIdentifier = (principal: Principal): AccountIdentifier =>
	AccountIdentifier.fromPrincipal({ principal, subAccount: undefined });

export const getBalance = ({
	owner,
	identity
}: {
	owner: Principal;
	identity: Identity | undefined | null;
}): Promise<bigint> => {
	if (isNullish(identity)) {
		throw new Error('No internet identity.');
	}

	return balance({
		index: {
			...container(),
			identity
		},
		accountIdentifier: getAccountIdentifier(owner).toHex()
	});
};

export const getTransactions = ({
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

	return transactions({
		index: {
			...container(),
			identity
		},
		args: {
			start,
			max_results: maxResults,
			account_identifier: getAccountIdentifier(owner).toHex()
		}
	});
};
