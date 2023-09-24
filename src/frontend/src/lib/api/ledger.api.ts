import { localIdentityCanisterId } from '$lib/constants/constants';
import { authStore } from '$lib/stores/auth.store';
import { nonNullish } from '$lib/utils/utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import type { GetAccountIdentifierTransactionsResponse } from '@junobuild/ledger';
import { AccountIdentifier, balance, transactions } from '@junobuild/ledger';
import { get } from 'svelte/store';

export const getAccountIdentifier = (principal: Principal): AccountIdentifier =>
	AccountIdentifier.fromPrincipal({ principal, subAccount: undefined });

export const getBalance = (owner: Principal): Promise<bigint> => {
	const identity: Identity | undefined | null = get(authStore).identity;

	if (!identity) {
		throw new Error('No internet identity.');
	}

	return balance({
		index: {
			...(nonNullish(localIdentityCanisterId) && { env: 'dev' }),
			identity
		},
		accountIdentifier: getAccountIdentifier(owner).toHex()
	});
};

export const getTransactions = ({
	owner
}: {
	owner: Principal;
}): Promise<GetAccountIdentifierTransactionsResponse> => {
	const identity: Identity | undefined | null = get(authStore).identity;

	if (!identity) {
		throw new Error('No internet identity.');
	}

	return transactions({
		index: {
			...(nonNullish(localIdentityCanisterId) && { env: 'dev' }),
			identity
		},
		args: {
			start: undefined,
			max_results: 100n,
			account_identifier: getAccountIdentifier(owner).toHex()
		}
	});
};
