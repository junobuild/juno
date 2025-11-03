import { missionControlCertifiedStore } from '$lib/stores/mission-control.store';
import { fromNullable } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const provider = derived([missionControlCertifiedStore], ([$missionControlDataStore]) =>
	fromNullable($missionControlDataStore?.data.provider ?? [])
);
