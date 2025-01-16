import { getCredits as getCreditsApi } from '$lib/api/console.api';
import { loadDataStore } from '$lib/services/loader.services';
import { creditsDataStore } from '$lib/stores/credits.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Option } from '$lib/types/utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';

export const loadCredits = async ({
	missionControlId,
	identity,
	reload = false
}: {
	missionControlId: Option<Principal>;
	identity: OptionIdentity;
	reload?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	if (isNullish(missionControlId)) {
		return { result: 'skip' };
	}

	const load = (identity: Identity): Promise<bigint> => getCreditsApi(identity);

	return await loadDataStore<bigint>({
		identity,
		store: creditsDataStore,
		errorLabel: 'load_credits',
		load,
		reload
	});
};
