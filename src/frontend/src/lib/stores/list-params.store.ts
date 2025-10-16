import type { ListFilter, ListOrder, ListParams } from '$lib/types/list';
import { getLocalListParams, setLocalStorageItem } from '$lib/utils/local-storage.utils';
import { type Readable, writable } from 'svelte/store';

export enum StoreContainers {
	STORAGE = 'STORAGE',
	USERS = 'USERS',
	CDN = 'CDN',
	DOCS = 'DOCS'
}

const saveListParams = ({ key, state }: { key: StoreContainers; state: ListParamsStoreData }) =>
	setLocalStorageItem({ key: `list_params_${key}`, value: JSON.stringify(state) });

export type ListParamsStoreData = Pick<ListParams, 'order' | 'filter'>;

export interface ListParamsStore extends Readable<ListParamsStoreData> {
	setOrder: (order: ListOrder) => void;
	setFilter: (filter: ListFilter) => void;
	reload: () => void;
}

const storesContainer = new Map<StoreContainers, ListParamsStore>();

const initListParamsStore = (key: StoreContainers): ListParamsStore => {
	const { subscribe, update } = writable<ListParamsStoreData>(getLocalListParams(key));

	return {
		subscribe,

		setOrder: (order: ListOrder) => {
			update((state) => {
				const updated_state = {
					...state,
					order
				};

				saveListParams({ key, state: updated_state });

				return updated_state;
			});
		},

		setFilter: (filter: ListFilter) => {
			update((state) => {
				const updated_state = {
					...state,
					filter
				};

				saveListParams({ key, state: updated_state });

				return updated_state;
			});
		},

		reload: () => {
			update((state) => ({
				...state
			}));
		}
	};
};

export const reloadListParamStores = () => storesContainer.forEach((store) => store.reload());

export const getListParamsStore = (storeId: StoreContainers): ListParamsStore => {
	if (storesContainer.has(storeId)) {
		return storesContainer.get(storeId) as ListParamsStore;
	}

	const store = initListParamsStore(storeId);
	storesContainer.set(storeId, store);
	return store;
};
