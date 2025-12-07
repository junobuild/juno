import { accountCertifiedStore } from '$lib/stores/account.store';
import { fromNullable } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const account = derived(
	[accountCertifiedStore],
	([$accountCertifiedStore]) => $accountCertifiedStore?.data
);

export const accountSatellites = derived([accountCertifiedStore], ([$accountCertifiedStore]) => {
	const satellites = fromNullable($accountCertifiedStore?.data.satellites ?? []);
	return (satellites ?? []).map(([_, satellite]) => satellite);
});
