import { AuthClientProvider } from '$lib/providers/auth-client.provider';
import type { Canister } from '$lib/types/canister';
import type { CertifiedData } from '$lib/types/store';
import { isNullish, nonNullish } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { getMany, type UseStore } from 'idb-keyval';

export const loadIdentity = async (): Promise<Identity | null> => {
	const authClient = await AuthClientProvider.getInstance().createAuthClient();

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

	const syncedCanisters = [...canistersNeverSynced, ...canisters];

	for (const canister of syncedCanisters) {
		emitCanister({ data: canister, certified: false });
	}

	emitCanisters(syncedCanisters.map((canister) => ({ data: canister, certified: false })));
};

type CertifiedEmitCanister<T> = CertifiedData<Canister<T>>;

// Update ui with one canister information at a time
export const emitCanister = <T>(data: CertifiedEmitCanister<T>) =>
	postMessage({
		msg: 'syncCanister',
		data: {
			canister: data
		}
	});

// Update ui with multiple canisters information
export const emitCanisters = <T>(canisters: CertifiedEmitCanister<T>[]) =>
	postMessage({
		msg: 'syncCanisters',
		data: {
			canisters
		}
	});
