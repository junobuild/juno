<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import Docs from '$lib/components/docs/Docs.svelte';
	import Doc from '$lib/components/docs/Doc.svelte';
	import { DATA_CONTEXT_KEY, type DataContext, type DataStoreData } from '$lib/types/data.context';
	import { writable } from 'svelte/store';
	import type { Doc as DocType, Doc as DocDid } from '$declarations/satellite/satellite.did';
	import Data from '$lib/components/data/Data.svelte';
	import DocForm from '../docs/DocForm.svelte';
	import DataCount from '$lib/components/data/DataCount.svelte';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import { initPaginationContext } from '$lib/stores/pagination.store';
	import { listDocs, satelliteVersion } from '$lib/api/satellites.api';
	import { authStore } from '$lib/stores/auth.store';
	import { isNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import { listDocs008 } from '$lib/api/satellites.deprecated.api';
	import { listParamsStore } from '$lib/stores/data.store';
	import type { ListParams } from '$lib/types/list';
	import { toasts } from '$lib/stores/toasts.store';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';

	const docsStore = writable<DataStoreData<DocDid>>(undefined);

	const resetData = () => docsStore.set(null);

	setContext<DataContext<DocDid>>(DATA_CONTEXT_KEY, {
		store: docsStore,
		resetData
	});

	const list = async () => {
		try {
			const version = await satelliteVersion({
				satelliteId: $store.satelliteId,
				identity: $authStore.identity
			});

			// TODO: remove at the same time as satellite version query
			if (isNullish(collection)) {
				setItems({ items: undefined, matches_length: undefined, items_length: undefined });
				return;
			}

			const list = compare(version, '0.0.9') >= 0 ? listDocs : listDocs008;

			const { items, matches_length, items_length } = await list({
				collection,
				satelliteId: $store.satelliteId,
				params: {
					startAfter: $paginationStore.startAfter,
					// prettier-ignore parenthesis required for Webstorm Svelte plugin
					...$listParamsStore
				} as ListParams,
				identity: $authStore.identity
			});
			setItems({ items, matches_length, items_length });
		} catch (err: unknown) {
			toasts.error({
				text: `Error while listing the documents.`,
				detail: err
			});
		}
	};

	setContext<PaginationContext<DocType>>(PAGINATION_CONTEXT_KEY, {
		...initPaginationContext(),
		list
	});

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	const { store: paginationStore, setItems }: PaginationContext<DocType> =
		getContext<PaginationContext<DocType>>(PAGINATION_CONTEXT_KEY);

	let collection: string | undefined;
	$: collection = $store.rule?.[0];
</script>

<Data on:junoCloseData={resetData}>
	<Docs />
	<Doc />
	<DocForm />

	<DataCount slot="count" />
</Data>
