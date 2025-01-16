import { getCredits } from '$lib/api/console.api';
import { loadDataStore } from '$lib/services/loader.services';
import { creditsDataStore } from '$lib/stores/credits.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Identity } from '@dfinity/agent';

export const loadCredits = async ({
	identity,
	reload = false
}: {
	identity: OptionIdentity;
	reload?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	const load = (identity: Identity): Promise<bigint> => getCredits(identity);

	return await loadDataStore<bigint>({
		identity,
		store: creditsDataStore,
		errorLabel: 'load_credits',
		load,
		reload
	});
};
