import type { ListOrder } from '$lib/types/list';
import { getLocalListOrder, setLocalStorageItem } from '$lib/utils/local-storage.utils';
import type { Readable } from 'svelte/store';
import { writable } from 'svelte/store';

const saveListOrder = (order: ListOrder) =>
	setLocalStorageItem({ key: 'order', value: JSON.stringify(order) });

export interface ListOrderStore extends Readable<ListOrder> {
	set: (order: ListOrder) => void;
}

const initListOrderStore = (): ListOrderStore => {
	const { subscribe, set } = writable<ListOrder>(getLocalListOrder());

	return {
		subscribe,

		set: (order: ListOrder) => {
			set(order);

			saveListOrder(order);
		}
	};
};

export const listOrderStore = initListOrderStore();
