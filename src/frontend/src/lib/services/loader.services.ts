import type { DataStore } from '$lib/stores/_data.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Identity } from '@dfinity/agent';
import { assertNonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const loadDataStore = async <T>({
	identity,
	store: dataStore,
	load,
	errorLabel,
	reload = false
}: {
	identity: OptionIdentity;
	store: DataStore<T>;
	load: (identity: Identity) => Promise<T>;
	errorLabel: keyof I18nErrors;
	reload?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		const store = get(dataStore);

		if (store !== undefined && !reload) {
			return { result: 'skip' };
		}

		const data = await load(identity);

		dataStore.set(data);

		return { result: 'success' };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors[errorLabel],
			detail: err
		});

		dataStore.reset();

		return { result: 'error' };
	}
};
