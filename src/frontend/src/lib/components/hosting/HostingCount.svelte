<script lang="ts">
	import { untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import { countHostingAssets } from '$lib/services/hosting.storage.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';
	import type { MissionControlDid } from '$lib/types/declarations';

	interface Props {
		satellite: MissionControlDid.Satellite;
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
