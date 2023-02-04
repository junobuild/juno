import { authStore } from '$lib/stores/auth.store';
import { getAgent } from '$lib/utils/agent.utils';
import type { Identity } from '@dfinity/agent';
import { AccountIdentifier, ICPToken, LedgerCanister, TokenAmount } from '@dfinity/nns';
import type { Principal } from '@dfinity/principal';
import { get } from 'svelte/store';

export const getAccountIdentifier = (principal: Principal): AccountIdentifier =>
	AccountIdentifier.fromPrincipal({ principal, subAccount: undefined });

export const getBalance = async (accountIdentifier: AccountIdentifier): Promise<TokenAmount> => {
	const identity: Identity | undefined | null = get(authStore).identity;

	if (!identity) {
		throw new Error('No internet identity.');
	}

	const agent = await getAgent({ identity });

	const ledger: LedgerCanister = LedgerCanister.create({
		agent,
		canisterId: import.meta.env.VITE_LEDGER_CANISTER_ID
	});

	const e8sBalance = await ledger.accountBalance({
		accountIdentifier,
		certified: false
	});

	return TokenAmount.fromE8s({ amount: e8sBalance, token: ICPToken });
};
