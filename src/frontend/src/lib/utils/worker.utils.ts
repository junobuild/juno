import type { Canister } from '$lib/types/canister';
import { createAuthClient } from '$lib/utils/auth.utils';
import type { Identity } from '@dfinity/agent';
import { isNullish, nonNullish } from '@dfinity/utils';
import { getMany, type UseStore } from 'idb-keyval';

export const loadIdentity = async (): Promise<Identity | null> => {
	const authClient = await createAuthClient();

	if (!(await authClient.isAuthenticated())) {
		return null;
	}

	// Should never happens, AuthClient contains either an authenticated user or an anonymous user
	if (isNullish(authClient.getIdentity())) {
		return null;
	}

	if (authClient.getIdentity().getPrincipal().isAnonymous()) {
		return null;
	}

	return authClient.getIdentity();
};

export const emitSavedCanisters = async <T extends Canister<T>>({
	canisterIds,
	customStore
}: {
	canisterIds: string[];
	customStore: UseStore;
}) => {
	const canisters: T[] = (await getMany(canisterIds, customStore))
		.filter(nonNullish)
		.map((canister) => ({
			...canister,
			sync: 'syncing'
		}));

	const canistersNeverSynced = canisterIds
		.filter((id) => canisters.find(({ id: syncedId }) => id === syncedId) === undefined)
		.map(
			(id) =>
				({
					id,
					sync: 'loading'
				}) as Canister<T>
		);

	await Promise.all(canistersNeverSynced.map(emitCanister));

	await Promise.all(canisters.map(emitCanister));
};

// Update ui with one canister information
export const emitCanister = <T>(canister: Canister<T>) =>
	postMessage({
		msg: 'syncCanister',
		data: {
			canister
		}
	});
