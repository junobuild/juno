<script lang="ts">
	import type { RulesContext } from '$lib/types/rules.context';
	import { getContext, setContext } from 'svelte';
	import { RULES_CONTEXT_KEY } from '$lib/types/rules.context';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { listDocs } from '$lib/api/satellites.api';
	import { toasts } from '$lib/stores/toasts.store';
	import type { Doc as DocType } from '$declarations/satellite/satellite.did';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import { initPaginationContext } from '$lib/stores/pagination.store';
	import { DATA_CONTEXT_KEY, type DataContext } from '$lib/types/data.context';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import DataOrder from '$lib/components/data/DataOrder.svelte';
	import type { ListOrder } from '$lib/types/list';
	import { DEFAULT_LIST_ORDER } from '$lib/constants/data.constants';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	const list = async () => {
		if (isNullish(collection)) {
			setItems({ items: undefined, matches_length: undefined });
			return;
		}

		try {
			const { items, matches_length } = await listDocs({
				collection,
				satelliteId: $store.satelliteId,
				params: {
					startAfter: $paginationStore.startAfter,
					order
				}
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

	let order: ListOrder = DEFAULT_LIST_ORDER;

	$: collection,
		order,
		(async () => {
			resetPage();
			await list();
		})();

	let empty = false;
	$: empty = $paginationStore.items?.length === 0 && collection !== undefined;

	const { store: docsStore }: DataContext<DocType> =
		getContext<DataContext<DocType>>(DATA_CONTEXT_KEY);

	let emptyCollection = false;
	$: emptyCollection = $store.rules?.length === 0;
</script>

<div class="title">
	<DataOrder on:junoOrder={({ detail: updateOrder }) => (order = updateOrder)}>
		{$i18n.datastore.documents}
	</DataOrder>
</div>

{#if !emptyCollection}
	<div
		class="data"
		class:data-selected={nonNullish($docsStore.data)}
		class:data-nullish={isNullish($paginationStore.items)}
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
				<p class="empty">Your collection <strong>{collection ?? ''}</strong> is empty.</p>
			{/if}
		{/if}
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/data';

	@include data.list;
</style>
