import { page } from '$app/stores';
import { isNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const tabStore: Readable<string | undefined> = derived([page], ([page]) => {
	const { data } = page;

	if (isNullish(data.tab)) {
		return undefined;
	}

	return data.tab;
});
