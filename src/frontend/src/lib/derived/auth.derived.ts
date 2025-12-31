import { authStore } from '$lib/stores/auth.store';
import { nonNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const authSignedIn = derived(authStore, ({ identity }) => nonNullish(identity));

export const authNotSignedIn = derived(authSignedIn, ($authSignedIn) => !$authSignedIn);

export const authSignedOut = derived([authSignedIn], ([$authSignedIn]) => !$authSignedIn);

export const authIdentity = derived(authStore, ({ identity }) => identity);
