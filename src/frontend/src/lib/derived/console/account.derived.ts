import { accountCertifiedStore } from '$lib/stores/account.store';
import { fromNullable } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const account = derived(
	[accountCertifiedStore],
	([$accountCertifiedStore]) => $accountCertifiedStore?.data
);

export const accountSatellites = derived([account], ([$account]) => {
	const satellites = fromNullable($account?.satellites ?? []);
	return (satellites ?? []).map(([_, satellite]) => satellite);
});
