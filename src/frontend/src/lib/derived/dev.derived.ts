import { authStore } from '$lib/stores/auth.store';
import { derived } from 'svelte/store';

export const devId = derived(authStore, ($authStore) => $authStore.identity?.getPrincipal());
