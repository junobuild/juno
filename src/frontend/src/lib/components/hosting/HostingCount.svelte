<script lang="ts">
	import { untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import { countHostingAssets } from '$lib/services/satellite/hosting.storage.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { authStore } from '$lib/stores/auth.store';
	import { versionStore } from '$lib/stores/version.store';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let assets = $state(0n);

	const load = async () => {
		const result = await countHostingAssets({
			satellite,
			identity: $authStore.identity
		});

		assets = result.result === 'success' ? result.count : 0n;
	};

	$effect(() => {
		$versionStore;

		untrack(() => {
			load();
		});
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
