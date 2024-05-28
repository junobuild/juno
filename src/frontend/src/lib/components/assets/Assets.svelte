<script lang="ts">
	import type { RulesContext } from '$lib/types/rules.context';
	import { getContext } from 'svelte';
	import { RULES_CONTEXT_KEY } from '$lib/types/rules.context';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { deleteAssets } from '$lib/api/satellites.api';
	import type { AssetNoContent } from '$declarations/satellite/satellite.did';
	import type { PaginationContext } from '$lib/types/pagination.context';
	import { PAGINATION_CONTEXT_KEY } from '$lib/types/pagination.context';
	import type { DataContext } from '$lib/types/data.context';
	import { DATA_CONTEXT_KEY } from '$lib/types/data.context';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import DataCollectionHeader from '$lib/components/data/DataCollectionHeader.svelte';
	import { listParamsStore } from '$lib/stores/data.store';
	import CollectionEmpty from '$lib/components/collections/CollectionEmpty.svelte';
	import DataCollectionDelete from '$lib/components/data/DataCollectionDelete.svelte';
	import type { Principal } from '@dfinity/principal';
	import { authStore } from '$lib/stores/auth.store';
	import AssetUpload from '$lib/components/assets/AssetUpload.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { emit } from '$lib/utils/events.utils';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let collection: string | undefined;
	$: collection = $store.rule?.[0];

	const {
		store: paginationStore,
		resetPage,
		list
	}: PaginationContext<AssetNoContent> = getContext<PaginationContext<AssetNoContent>>(
		PAGINATION_CONTEXT_KEY
	);

	let empty = false;
	$: empty = $paginationStore.items?.length === 0 && nonNullish(collection);

	const { store: assetsStore, resetData }: DataContext<AssetNoContent> =
		getContext<DataContext<AssetNoContent>>(DATA_CONTEXT_KEY);

	let emptyCollection = false;
	$: emptyCollection = $store.rules?.length === 0;

	const load = async () => {
		resetPage();
		resetData();
		await list();
	};

	$: collection, $listParamsStore, (async () => await load())();

	/**
	 * Delete data
	 */

	let deleteData: (params: { collection: string; satelliteId: Principal }) => Promise<void>;
	$: deleteData = async (params: { collection: string; satelliteId: Principal }) => {
		await deleteAssets({ ...params, identity: $authStore.identity });

		resetData();
	};

	const reload = async () => {
		emit({ message: 'junoCloseActions' });
		await load();
	};
</script>

<div class="title">
	<DataCollectionHeader>
		{$i18n.storage.assets}

		<svelte:fragment slot="actions">
			<AssetUpload on:junoUploaded={reload}>
				<svelte:fragment slot="action">{$i18n.asset.upload_file}</svelte:fragment>
				<svelte:fragment slot="title">{$i18n.asset.upload_file}</svelte:fragment>
				{@html i18nFormat($i18n.asset.upload_description, [
					{
						placeholder: '{0}',
						value: collection ?? ''
					}
				])}
			</AssetUpload>

			<DataCollectionDelete {deleteData}>
				<svelte:fragment slot="button">{$i18n.collections.clear_collection}</svelte:fragment>
				<svelte:fragment slot="title">{$i18n.collections.clear_collection}</svelte:fragment>
				{@html i18nFormat($i18n.asset.delete_all, [
					{
						placeholder: '{0}',
						value: collection ?? ''
					}
				])}
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
