import { authStore } from '$lib/stores/auth.store';
import { nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const authSignedIn: Readable<boolean> = derived(authStore, ({ identity }) =>
	nonNullish(identity)
);

export const authNotSignedIn: Readable<boolean> = derived(
	authSignedIn,
	($authSignedIn) => !$authSignedIn
);

export const authSignedOut: Readable<boolean> = derived(
	[authSignedIn],
	([$authSignedIn]) => !$authSignedIn
);
