import { accountCertifiedStore } from '$lib/stores/account.store';
import { fromNullable, isNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const account = derived(
	[accountCertifiedStore],
	([$accountCertifiedStore]) => $accountCertifiedStore?.data
);

export const accountSatellites = derived([account], ([$account]) => {
	const satellites = fromNullable($account?.satellites ?? []);
	return (satellites ?? []).map(([_, satellite]) => satellite);
});

export const accountOrbiters = derived([account], ([$account]) => {
	if (isNullish($account)) {
		return undefined;
	}

	const orbiters = fromNullable($account?.orbiters ?? []);

	if (isNullish(orbiters)) {
		return null;
	}

	const orbiter = orbiters.map(([_, orbiter]) => orbiter);

	if (orbiter.length === 0) {
		return null;
	}

	return orbiter;
});
