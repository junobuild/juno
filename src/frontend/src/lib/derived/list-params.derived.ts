import { LIST_PARAMS_CONTEXT_KEY, type ListParamsContext } from '$lib/types/list-params.context';
import { nonNullish } from '@dfinity/utils';
import { getContext } from 'svelte';
import { derived, type Readable } from 'svelte/store';

export const getDerivedListParamsFiltered = (): Readable<boolean> => {
	const { store: listParamsStore }: ListParamsContext =
		getContext<ListParamsContext>(LIST_PARAMS_CONTEXT_KEY);

	return derived(
		listParamsStore,
		({ filter: { matcher, owner } }) =>
			(nonNullish(matcher) && matcher !== '') || (nonNullish(owner) && owner !== '')
	);
};
