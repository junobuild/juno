<script lang="ts">
	import { setContext } from 'svelte';
	import { DATA_CONTEXT_KEY, type DataContext, type DataStore } from '$lib/types/data.context';
	import { writable } from 'svelte/store';
	import type { AssetNoContent } from '$declarations/satellite/satellite.did';
	import Data from '$lib/components/data/Data.svelte';
	import Assets from '$lib/components/assets/Assets.svelte';
	import Asset from '$lib/components/assets/Asset.svelte';

	const initialAsset = {
		data: undefined,
		key: undefined
	};

	const assetsStore = writable<DataStore<AssetNoContent>>(initialAsset);

	const resetData = () => assetsStore.set(initialAsset);

	setContext<DataContext<AssetNoContent>>(DATA_CONTEXT_KEY, {
		store: assetsStore,
		resetData
	});

	const closeAsset = () => assetsStore.set({ key: undefined, data: undefined });
</script>

<Data on:junoCloseData={() => closeAsset()}>
	<Assets />

	<Asset />
</Data>
