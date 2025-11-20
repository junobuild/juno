import type { ListFilter, ListOrder } from '$lib/types/list';
import type {
	ListParamsContext,
	ListParamsData,
	ListParamsKey
} from '$lib/types/list-params.context';
import { getLocalListParams, setLocalStorageItem } from '$lib/utils/local-storage.utils';
import { derived, writable } from 'svelte/store';

const saveListParams = ({ key, state }: { key: ListParamsKey; state: ListParamsData }) =>
	setLocalStorageItem({ key: `list_params_${key}`, value: JSON.stringify(state) });

// Key input is required for persistent (local) storage
export const initListParamsContext = (key: ListParamsKey): ListParamsContext => {
	const store = writable<ListParamsData>(getLocalListParams(key));

	const listParams = derived(store, (store) => store);

	return {
		key,
		listParams,
		setOrder: (order: ListOrder) => {
			store.update((state) => {
				const updated_state = {
					...state,
					order
				};

				saveListParams({ key, state: updated_state });

				return updated_state;
			});
		},

		setFilter: (filter: ListFilter) => {
			store.update((state) => {
				const updated_state = {
					...state,
					filter
				};

				saveListParams({ key, state: updated_state });

				return updated_state;
			});
		},

		reload: () => {
			store.update((state) => ({
				...state
			}));
		}
	};
};
