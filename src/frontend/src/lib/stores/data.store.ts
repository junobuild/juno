import { DEFAULT_LIST_ORDER } from '$lib/constants/data.constants';
import type { ListOrder } from '$lib/types/list';
import { writable } from 'svelte/store';

export const listOrderStore = writable<ListOrder>(DEFAULT_LIST_ORDER);
