import { DEFAULT_LIST_PARAMS } from '$lib/constants/data.constants';
import type { ListFilter, ListOrder, ListParams } from '$lib/types/list';
import { getLocalListParams, setLocalStorageItem } from '$lib/utils/local-storage.utils';
import { nonNullish } from '$lib/utils/utils';
import type { Readable } from 'svelte/store';
import { derived, writable } from 'svelte/store';

const saveListParams = (state: ListParamsStoreData) =>
	setLocalStorageItem({ key: 'list_params', value: JSON.stringify(state) });

export type ListParamsStoreData = Pick<ListParams, 'order' | 'filter'>;

export interface ListParamsStore extends Readable<ListParamsStoreData> {
	setOrder: (order: ListOrder) => void;
	setFilter: (filter: ListFilter) => void;
	reset: () => void;
}

const initListParamsStore = (): ListParamsStore => {
	const { subscribe, update, set } = writable<ListParamsStoreData>(getLocalListParams());

	return {
		subscribe,

		setOrder: (order: ListOrder) => {
			update((state) => {
				const updated_state = {
					...state,
					order
				};

				saveListParams(updated_state);

				return updated_state;
			});
		},

		setFilter: (filter: ListFilter) => {
			update((state) => {
				const updated_state = {
					...state,
					filter
				};

				saveListParams(updated_state);

				return updated_state;
			});
		},

		reset: () => {
			set(DEFAULT_LIST_PARAMS);
			saveListParams(DEFAULT_LIST_PARAMS);
		}
	};
};

export const listParamsStore = initListParamsStore();

export const listParamsFilteredStore: Readable<boolean> = derived(
	listParamsStore,
	({ filter: { matcher, owner } }) =>
		(nonNullish(matcher) && matcher !== '') || (nonNullish(owner) && owner !== '')
);
