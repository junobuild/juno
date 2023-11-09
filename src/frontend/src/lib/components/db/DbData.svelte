<script lang="ts">
	import { setContext } from 'svelte';
	import Docs from '$lib/components/docs/Docs.svelte';
	import Doc from '$lib/components/docs/Doc.svelte';
	import { DATA_CONTEXT_KEY, type DataContext, type DataStoreData } from '$lib/types/data.context';
	import { writable } from 'svelte/store';
	import type { Doc as DocDid } from '$declarations/satellite/satellite.did';
	import Data from '$lib/components/data/Data.svelte';
	import DocForm from '../docs/DocForm.svelte';

	const docsStore = writable<DataStoreData<DocDid>>(undefined);

	const resetData = () => docsStore.set(null);

	setContext<DataContext<DocDid>>(DATA_CONTEXT_KEY, {
		store: docsStore,
		resetData
	});
</script>

<Data on:junoCloseData={resetData}>
	<Docs />
	<Doc />
	<DocForm />
</Data>
