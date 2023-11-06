<script lang="ts">
	import { setContext } from 'svelte';
	import { DATA_CONTEXT_KEY, type DataContext, type DataStoreData } from '$lib/types/data.context';
	import { writable } from 'svelte/store';
	import type { AssetNoContent } from '$declarations/satellite/satellite.did';
	import Data from '$lib/components/data/Data.svelte';
	import Assets from '$lib/components/assets/Assets.svelte';
	import Asset from '$lib/components/assets/Asset.svelte';

	const assetsStore = writable<DataStoreData<AssetNoContent>>(undefined);

	const resetData = () => assetsStore.set(null);

	setContext<DataContext<AssetNoContent>>(DATA_CONTEXT_KEY, {
		store: assetsStore,
		resetData
	});
</script>

<Data on:junoCloseData={resetData}>
	<Assets />

	<Asset />
</Data>
