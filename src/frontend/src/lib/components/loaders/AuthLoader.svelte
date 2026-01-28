<script lang="ts">
	import type { Snippet } from 'svelte';
	import { browser } from '$app/environment';
	import { initAccount } from '$lib/services/console/account.services';
	import { displayAndCleanLogoutMsg } from '$lib/services/console/auth/auth.services';
	import { authStore } from '$lib/stores/auth.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	/**
	 * App sync
	 */

	const syncAuthStore = async () => {
		if (!browser) {
			return;
		}

		try {
			await authStore.sync();
		} catch (err: unknown) {
			console.error(err);
		}

		displayAndCleanLogoutMsg();
	};

	const sync = async () => {
		await syncAuthStore();
	};

	$effect(() => {
		initAccount($authStore);
	});
</script>

<svelte:window onstorage={syncAuthStore} />

{#await sync()}
	<!-- No animation as initializing the auth should be fast -->
{:then _}
	{@render children()}
{/await}
