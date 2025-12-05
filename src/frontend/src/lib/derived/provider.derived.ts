import { accountCertifiedStore } from '$lib/stores/account.store';
import { fromNullable } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const provider = derived([accountCertifiedStore], ([$missionControlDataStore]) =>
	fromNullable($missionControlDataStore?.data.provider ?? [])
);
