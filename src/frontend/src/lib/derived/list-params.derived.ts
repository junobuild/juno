import type { ListParamsStore } from '$lib/stores/list-params.store';
import { nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const getDerivedListParamsFiltered = (listParamsStore: ListParamsStore): Readable<boolean> =>
	derived(
		listParamsStore,
		({ filter: { matcher, owner } }) =>
			(nonNullish(matcher) && matcher !== '') || (nonNullish(owner) && owner !== '')
	);
