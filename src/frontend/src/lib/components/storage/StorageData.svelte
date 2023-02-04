<script lang="ts">
	import { setContext } from 'svelte';
	import { DATA_CONTEXT_KEY, type DataContext, type DataStore } from '$lib/types/data.context';
	import { writable } from 'svelte/store';
	import type { AssetNoContent } from '$declarations/satellite/satellite.did';
	import Data from '$lib/components/data/Data.svelte';
	import Assets from '$lib/components/assets/Assets.svelte';
	import Asset from '$lib/components/assets/Asset.svelte';

	const assetsStore = writable<DataStore<AssetNoContent>>({
		data: undefined,
		key: undefined
	});

	setContext<DataContext<AssetNoContent>>(DATA_CONTEXT_KEY, {
		store: assetsStore
	});

	const closeAsset = () => assetsStore.set({ key: undefined, data: undefined });
</script>

<Data on:junoCloseData={() => closeAsset()}>
	<Assets />

	<Asset />
</Data>
