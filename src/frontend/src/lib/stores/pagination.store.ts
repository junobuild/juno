import { PAGINATION } from '$lib/constants/app.constants';
import type { PaginationContext, PaginationData } from '$lib/types/pagination.context';
import { last } from '$lib/utils/utils';
import { nonNullish } from '@dfinity/utils';
import { derived, writable } from 'svelte/store';

export const initPaginationContext = <T>(): Omit<PaginationContext<T>, 'list'> => {
	const store = writable<PaginationData<T>>({
		selectedPage: 0
	});

	const startAfter = derived([store], ([{ startAfters }]) => last(startAfters ?? []));

	return {
		store,

		startAfter,

		nextPage: () => {
			store.update(({ selectedPage, startAfters, items, ...rest }) => {
				const lastKey = last(items ?? [])?.[0];

				return {
					...rest,
					items,
					selectedPage: selectedPage + 1,
					startAfters: [...(startAfters ?? []), ...(nonNullish(lastKey) ? [lastKey] : [])]
				};
			});
		},

		previousPage: () => {
			store.update(({ selectedPage, startAfters, ...rest }) => ({
				...rest,
				selectedPage: selectedPage - 1,
				startAfters: startAfters?.slice(0, -1)
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
