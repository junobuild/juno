import { page } from '$app/stores';
import { isNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const satelliteIdStore: Readable<string | undefined> = derived([page], ([page]) => {
	const { data } = page;

	if (isNullish(data.satellite)) {
		return undefined;
	}

	return data.satellite;
});
