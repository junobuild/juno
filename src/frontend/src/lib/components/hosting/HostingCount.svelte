<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { countAssets } from '$lib/api/satellites.api';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { authStore } from '$lib/stores/auth.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18n } from '$lib/stores/i18n.store';

	export let satellite: Satellite;

	let assets = 0n;

	onMount(async () => {
		try {
			assets = await countAssets({
				satelliteId: satellite.satellite_id,
				collection: '#dapp',
				identity: $authStore.identity
			});
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.hosting_count_assets,
				detail: err
			});
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
