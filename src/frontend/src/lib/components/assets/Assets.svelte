<script lang="ts">
	import type { RulesContext } from '$lib/types/rules.context';
	import { getContext, setContext } from 'svelte';
	import { RULES_CONTEXT_KEY } from '$lib/types/rules.context';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { listAssets, listDocs, satelliteVersion } from '$lib/api/satellites.api';
	import { toasts } from '$lib/stores/toasts.store';
	import type { AssetNoContent } from '$declarations/satellite/satellite.did';
	import type { PaginationContext } from '$lib/types/pagination.context';
	import { PAGINATION_CONTEXT_KEY } from '$lib/types/pagination.context';
	import { initPaginationContext } from '$lib/stores/pagination.store';
	import type { DataContext } from '$lib/types/data.context';
	import { DATA_CONTEXT_KEY } from '$lib/types/data.context';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import DataList from '$lib/components/data/DataList.svelte';
	import { listParamsStore } from '$lib/stores/data.store';
	import CollectionEmpty from '$lib/components/collections/CollectionEmpty.svelte';
	import type { ListParams } from '$lib/types/list';
	import { compare } from 'semver';
	import { listAssetsDeprecated } from '$lib/api/satellites.deprected.api';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	const list = async () => {
		if (isNullish(collection)) {
			setItems({ items: undefined, matches_length: undefined });
			return;
		}

		try {
			const version = await satelliteVersion({ satelliteId: $store.satelliteId });

			// TODO: remove at the same time as satellite version query
			if (isNullish(collection)) {
				setItems({ items: undefined, matches_length: undefined });
				return;
			}

			const list = compare(version, '0.0.9') >= 0 ? listAssets : listAssetsDeprecated;

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
				text: `Error while listing the assets.`,
				detail: err
			});
		}
	};

	setContext<PaginationContext<AssetNoContent>>(PAGINATION_CONTEXT_KEY, {
		...initPaginationContext(),
		list
	});

	const {
		store: paginationStore,
		resetPage,
		setItems
	}: PaginationContext<AssetNoContent> = getContext<PaginationContext<AssetNoContent>>(
		PAGINATION_CONTEXT_KEY
	);

	let collection: string | undefined;
	$: collection = $store.rule?.[0];

	let empty = false;
	$: empty = $paginationStore.items?.length === 0 && collection !== undefined;

	const { store: assetsStore, resetData }: DataContext<AssetNoContent> =
		getContext<DataContext<AssetNoContent>>(DATA_CONTEXT_KEY);

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
		{$i18n.storage.assets}
	</DataList>
</div>

{#if !emptyCollection}
	<div
		class="data"
		class:data-selected={nonNullish($assetsStore.data)}
		class:data-nullish={isNullish($paginationStore.items)}
	>
		{#if nonNullish($paginationStore.items)}
			{#each $paginationStore.items as item}
				{@const asset = item[1]}
				{@const key = asset.key.full_path}

				<button class="text action" on:click={() => assetsStore.set({ key, data: asset })}
					><span>{key}</span></button
				>
			{/each}

			{#if !empty}
				<DataPaginator />
			{/if}

			{#if empty}
				<CollectionEmpty {collection}>
					<svelte:fragment slot="filter">{$i18n.asset.no_match}</svelte:fragment>
				</CollectionEmpty>
			{/if}
		{/if}
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/data';

	@include data.list;
</style>
