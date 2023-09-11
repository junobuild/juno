import { localIdentityCanisterId } from '$lib/constants/constants';
import { authStore } from '$lib/stores/auth.store';
import { getAgent } from '$lib/utils/agent.utils';
import { nonNullish } from '$lib/utils/utils';
import type { Identity } from '@dfinity/agent';
import { IcrcLedgerCanister } from '@dfinity/ledger';
import type { Principal } from '@dfinity/principal';
import { AccountIdentifier, balance as balanceApi, transactions } from '@junobuild/ledger';
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

	// TODO: this is a test
	console.log(
		await balanceApi({
			index: {
				...(nonNullish(localIdentityCanisterId) && { env: 'dev' }),
				identity
			},
			accountIdentifier: getAccountIdentifier(owner).toHex()
		}),
		await transactions({
			index: {
				...(nonNullish(localIdentityCanisterId) && { env: 'dev' }),
				identity
			},
			args: {
				start: undefined,
				max_results: 100n,
				account_identifier: getAccountIdentifier(owner).toHex()
			}
		})
	);

	return balance({
		owner,
		certified: false
	});
};
