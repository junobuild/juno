import { accountCertifiedStore } from '$lib/stores/account.store';
import { derived } from 'svelte/store';

export const account = derived(
	[accountCertifiedStore],
	([$accountCertifiedStore]) => $accountCertifiedStore?.data
);
