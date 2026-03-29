import { getCredits } from '$lib/api/console.api';
import { loadDataStore } from '$lib/services/_loader.services';
import { creditsUncertifiedStore } from '$lib/stores/console/credits.store';
import type { NullishIdentity } from '$lib/types/itentity';
import type { Identity } from '@icp-sdk/core/agent';

export const loadCredits = async ({
	identity,
	reload = false
}: {
	identity: NullishIdentity;
	reload?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	const load = (identity: Identity): Promise<bigint> => getCredits(identity);

	return await loadDataStore<bigint>({
		identity,
		store: creditsUncertifiedStore,
		errorLabel: 'load_credits',
		load,
		reload
	});
};
