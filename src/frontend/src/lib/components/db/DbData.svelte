<script lang="ts">
	import { setContext } from 'svelte';
	import Docs from '$lib/components/docs/Docs.svelte';
	import Doc from '$lib/components/docs/Doc.svelte';
	import { DATA_CONTEXT_KEY, type DataContext, type DataStore } from '$lib/types/data.context';
	import { writable } from 'svelte/store';
	import type { Doc as DocDid } from '$declarations/satellite/satellite.did';
	import Data from '$lib/components/data/Data.svelte';
	import DocForm from '../docs/DocForm.svelte';

	const initialDoc = {
		data: undefined,
		key: undefined
	};

	const docsStore = writable<DataStore<DocDid>>(initialDoc);

	const resetData = () => docsStore.set(initialDoc);

	setContext<DataContext<DocDid>>(DATA_CONTEXT_KEY, {
		store: docsStore,
		resetData
	});

	const closeDoc = () => docsStore.set({ key: undefined, data: undefined, state: undefined });
</script>

<Data on:junoCloseData={() => closeDoc()}>
	<Docs />
	<Doc />
	<DocForm />
</Data>
