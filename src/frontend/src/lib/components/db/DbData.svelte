<script lang="ts">
	import { setContext } from 'svelte';
	import Docs from '$lib/components/docs/Docs.svelte';
	import Doc from '$lib/components/docs/Doc.svelte';
	import { DATA_CONTEXT_KEY, type DataContext, type DataStore } from '$lib/types/data.context';
	import { writable } from 'svelte/store';
	import type { Doc as DocDid } from '$declarations/satellite/satellite.did';
	import Data from '$lib/components/data/Data.svelte';

	const docsStore = writable<DataStore<DocDid>>({
		data: undefined,
		key: undefined
	});

	setContext<DataContext<DocDid>>(DATA_CONTEXT_KEY, {
		store: docsStore
	});

	const closeDoc = () => docsStore.set({ key: undefined, data: undefined });
</script>

<Data on:junoCloseData={() => closeDoc()}>
	<Docs />

	<Doc />
</Data>
