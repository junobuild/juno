<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { countCollectionAssets } from '$lib/api/satellites.api';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';

	export let satellite: Satellite;

	let assets = 0n;

	onMount(async () => {
		try {
			assets = await countCollectionAssets({
				satelliteId: satellite.satellite_id,
				collection: '#dapp',
				identity: $authStore.identity
			});
		} catch (err: unknown) {
			// We do not toast the error for simplicity reasons.
			// In Satellite v0.0.20, the endpoint to list the number of assets in a collection was renamed from `count_assets` to `count_collection_assets`.
			console.error($i18n.errors.hosting_count_assets, err);
		}
	});
</script>

{#if assets > 0}
	<p in:fade><small>{assets} {$i18n.hosting.files_deployed}</small></p>
{/if}

<style lang="scss">
	p {
		padding: 0 var(--padding) 0 0;
	}

	small {
		font-size: var(--font-size-very-small);
	}
</style>
