import { authStore } from '$lib/stores/auth.store';
import { getAgent } from '$lib/utils/agent.utils';
import type { Identity } from '@dfinity/agent';
import { IcrcLedgerCanister } from '@dfinity/ledger';
import type { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@junobuild/ledger';
import { get } from 'svelte/store';

export const getAccountIdentifier = (principal: Principal): AccountIdentifier =>
	AccountIdentifier.fromPrincipal({ principal, subAccount: undefined });

export const getBalance = async (owner: Principal): Promise<bigint> => {
	const identity: Identity | undefined | null = get(authStore).identity;

	if (!identity) {
		throw new Error('No internet identity.');
	}

	const agent = await getAgent({ identity });

	const { balance } = IcrcLedgerCanister.create({
		agent,
		canisterId: import.meta.env.VITE_LEDGER_CANISTER_ID
	});

	return balance({
		owner,
		certified: false
	});
};
