import { PAGINATION } from '$lib/constants/constants';
import type { PaginationContext, PaginationStore } from '$lib/types/pagination.context';
import { last } from '$lib/utils/utils';
import { nonNullish } from '@dfinity/utils';
import { writable } from 'svelte/store';

export const initPaginationContext = <T>(): Omit<PaginationContext<T>, 'list'> => {
	const store = writable<PaginationStore<T>>({
		selectedPage: 0
	});

	return {
		store,

		nextPage: () => {
			store.update(({ selectedPage, startAfter, items, ...rest }) => ({
				...rest,
				items,
				selectedPage: selectedPage + 1,
				previousStartAfter: startAfter,
				startAfter: last(items ?? [])?.[0]
			}));
		},

		previousPage: () => {
			store.update(({ selectedPage, previousStartAfter, ...rest }) => ({
				...rest,
				selectedPage: selectedPage - 1,
				startAfter: previousStartAfter,
				previousStartAfter: undefined
			}));
		},

		resetPage: () => {
			store.set({
				selectedPage: 0
			});
		},

		setItems: ({
			items,
			matches_length,
			items_length
		}: {
			items: [string, T][] | undefined;
			matches_length: bigint | undefined;
			items_length: bigint | undefined;
		}) => {
			store.update((data) => ({
				...data,
				items,
				pages: nonNullish(matches_length)
					? Math.ceil(Number(matches_length) / Number(PAGINATION))
					: undefined,
				itemsLength: nonNullish(items_length) ? Number(items_length) : undefined,
				matchesLength: nonNullish(matches_length) ? Number(matches_length) : undefined
			}));
		}
	};
};
