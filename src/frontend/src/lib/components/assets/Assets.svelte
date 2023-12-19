<script lang="ts">
	import type { RulesContext } from '$lib/types/rules.context';
	import { getContext, setContext } from 'svelte';
	import { RULES_CONTEXT_KEY } from '$lib/types/rules.context';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { deleteAssets, listAssets, satelliteVersion } from '$lib/api/satellites.api';
	import { toasts } from '$lib/stores/toasts.store';
	import type { AssetNoContent } from '$declarations/satellite/satellite.did';
	import type { PaginationContext } from '$lib/types/pagination.context';
	import { PAGINATION_CONTEXT_KEY } from '$lib/types/pagination.context';
	import { initPaginationContext } from '$lib/stores/pagination.store';
	import type { DataContext } from '$lib/types/data.context';
	import { DATA_CONTEXT_KEY } from '$lib/types/data.context';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import DataCollectionHeader from '$lib/components/data/DataCollectionHeader.svelte';
	import { listParamsStore } from '$lib/stores/data.store';
	import CollectionEmpty from '$lib/components/collections/CollectionEmpty.svelte';
	import type { ListParams } from '$lib/types/list';
	import { compare } from 'semver';
	import { listAssets008, listAssets009 } from '$lib/api/satellites.deprecated.api';
	import DataCollectionDelete from '$lib/components/data/DataCollectionDelete.svelte';
	import type { Principal } from '@dfinity/principal';
	import { authStore } from '$lib/stores/auth.store';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	const list = async () => {
		if (isNullish(collection)) {
			setItems({ items: undefined, matches_length: undefined });
			return;
		}

		try {
			const version = await satelliteVersion({
				satelliteId: $store.satelliteId,
				identity: $authStore.identity
			});

			// TODO: remove at the same time as satellite version query
			if (isNullish(collection)) {
				setItems({ items: undefined, matches_length: undefined });
				return;
			}

			const list =
				compare(version, '0.0.10') >= 0
					? listAssets
					: compare(version, '0.0.9') >= 0
					? listAssets009
					: listAssets008;

			const { items, matches_length } = await list({
				collection,
				satelliteId: $store.satelliteId,
				params: {
					startAfter: $paginationStore.startAfter,
					// prettier-ignore parenthesis required for Webstorm Svelte plugin
					...$listParamsStore
				} as ListParams,
				identity: $authStore.identity
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
	$: empty = $paginationStore.items?.length === 0 && nonNullish(collection);

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

	/**
	 * Delete data
	 */

	let deleteData: (params: { collection: string; satelliteId: Principal }) => Promise<void>;
	$: deleteData = async (params: { collection: string; satelliteId: Principal }) => {
		await deleteAssets({ ...params, identity: $authStore.identity });

		resetData();
	};
</script>

<div class="title">
	<DataCollectionHeader>
		{$i18n.storage.assets}

		<svelte:fragment slot="actions">
			<DataCollectionDelete {deleteData}>
				<svelte:fragment slot="title">{$i18n.asset.delete_all}</svelte:fragment>
				{$i18n.core.are_you_sure}
			</DataCollectionDelete>
		</svelte:fragment>
	</DataCollectionHeader>
</div>

{#if !emptyCollection}
	<div
		class="data"
		class:data-selected={nonNullish($assetsStore?.data)}
		class:data-nullish={isNullish($paginationStore.items)}
	>
		{#if nonNullish($paginationStore.items)}
			{#each $paginationStore.items as item}
				{@const asset = item[1]}
				{@const key = asset.key.full_path}

				<button
					class="text action"
					on:click={() => assetsStore.set({ key, data: asset, action: 'view' })}
					><span>{key}</span></button
				>
			{/each}

			{#if !empty}
				<DataPaginator />
			{/if}

			{#if empty}
				<CollectionEmpty {collection} rule={$store.rule?.[1]}>
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
