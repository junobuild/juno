<script lang="ts">
	import type { RulesContext } from '$lib/types/rules.context';
	import { getContext, setContext } from 'svelte';
	import { RULES_CONTEXT_KEY } from '$lib/types/rules.context';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { listDocs, satelliteVersion } from '$lib/api/satellites.api';
	import { toasts } from '$lib/stores/toasts.store';
	import type { Doc as DocType } from '$declarations/satellite/satellite.did';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import { initPaginationContext } from '$lib/stores/pagination.store';
	import { DATA_CONTEXT_KEY, type DataContext } from '$lib/types/data.context';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import DataList from '$lib/components/data/DataList.svelte';
	import { listParamsStore } from '$lib/stores/data.store';
	import CollectionEmpty from '$lib/components/collections/CollectionEmpty.svelte';
	import type { ListParams } from '$lib/types/list';
	import { compare } from 'semver';
	import { listDocs008 } from '$lib/api/satellites.deprecated.api';
	import IconNew from '$lib/components/icons/IconNew.svelte';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	const list = async () => {
		try {
			const version = await satelliteVersion({ satelliteId: $store.satelliteId });

			// TODO: remove at the same time as satellite version query
			if (isNullish(collection)) {
				setItems({ items: undefined, matches_length: undefined });
				return;
			}

			const list = compare(version, '0.0.9') >= 0 ? listDocs : listDocs008;

			const { items, matches_length } = await list({
				collection,
				satelliteId: $store.satelliteId,
				params: {
					startAfter: $paginationStore.startAfter,
					// prettier-ignore parenthesis required for Webstorm Svelte plugin
					...$listParamsStore
				} as ListParams
			});
			setItems({ items, matches_length });
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
	const {
		store: paginationStore,
		resetPage,
		setItems
	}: PaginationContext<DocType> = getContext<PaginationContext<DocType>>(PAGINATION_CONTEXT_KEY);

	let collection: string | undefined;
	$: collection = $store.rule?.[0];

	let empty = false;
	$: empty = $paginationStore.items?.length === 0 && nonNullish(collection);

	const { store: docsStore, resetData }: DataContext<DocType> =
		getContext<DataContext<DocType>>(DATA_CONTEXT_KEY);

	let emptyCollection = false;
	$: emptyCollection = $store.rules?.length === 0;

	$: collection,
		$listParamsStore,
		(async () => {
			resetPage();
			resetData();
			await list();
		})();
</script>

<div class="title">
	<DataList>
		{$i18n.datastore.documents}
	</DataList>
</div>

{#if !emptyCollection}
	<div
		class="data"
		class:data-selected={nonNullish($docsStore.data)}
		class:data-nullish={isNullish($paginationStore.items)}
	>
		<button class="text action start" on:click={() => {}}
			><IconNew size="16px" /> <span>Add document</span></button
		>

		{#if nonNullish($paginationStore.items)}
			{#each $paginationStore.items as [key, doc]}
				<button class="text action" on:click={() => docsStore.set({ key, data: doc })}
					><span>{key}</span></button
				>
			{/each}

			{#if !empty}
				<DataPaginator />
			{/if}

			{#if empty}
				<CollectionEmpty {collection} rule={$store.rule?.[1]}>
					<svelte:fragment slot="filter">{$i18n.document.no_match}</svelte:fragment>
				</CollectionEmpty>
			{/if}
		{/if}
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/data';

	@include data.list;
</style>
