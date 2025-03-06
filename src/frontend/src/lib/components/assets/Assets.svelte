<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { getContext } from 'svelte';
	import { run } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import type { AssetNoContent } from '$declarations/satellite/satellite.did';
	import { deleteAssets } from '$lib/api/satellites.api';
	import AssetUpload from '$lib/components/assets/AssetUpload.svelte';
	import CollectionEmpty from '$lib/components/collections/CollectionEmpty.svelte';
	import DataCollectionDelete from '$lib/components/data/DataCollectionDelete.svelte';
	import DataCollectionHeader from '$lib/components/data/DataCollectionHeader.svelte';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { listParamsStore } from '$lib/stores/list-params.store';
	import { type DataContext, DATA_CONTEXT_KEY } from '$lib/types/data.context';
	import { type PaginationContext, PAGINATION_CONTEXT_KEY } from '$lib/types/pagination.context';
	import { type RulesContext, RULES_CONTEXT_KEY } from '$lib/types/rules.context';
	import { emit } from '$lib/utils/events.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	const { store, hasAnyRules }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let collection: string | undefined = $state();
	run(() => {
		collection = $store.rule?.[0];
	});

	const {
		store: paginationStore,
		resetPage,
		list
	}: PaginationContext<AssetNoContent> = getContext<PaginationContext<AssetNoContent>>(
		PAGINATION_CONTEXT_KEY
	);

	let empty = $state(false);
	run(() => {
		empty = $paginationStore.items?.length === 0 && nonNullish(collection);
	});

	const { store: assetsStore, resetData }: DataContext<AssetNoContent> =
		getContext<DataContext<AssetNoContent>>(DATA_CONTEXT_KEY);

	const load = async () => {
		resetPage();
		resetData();
		await list();
	};

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		collection, $listParamsStore, (async () => await load())();
	});

	/**
	 * Delete data
	 */

	let deleteData: (params: { collection: string; satelliteId: Principal }) => Promise<void> =
		$derived(async (params: { collection: string; satelliteId: Principal }) => {
			await deleteAssets({ ...params, identity: $authStore.identity });

			resetData();
		});

	const reload = async () => {
		emit({ message: 'junoCloseActions' });
		await load();
	};
</script>

<div class="title">
	<DataCollectionHeader>
		{$i18n.storage.assets}

		{#snippet actions()}
			<AssetUpload on:junoUploaded={reload}>
				{#snippet action()}
					{$i18n.asset.upload_file}
				{/snippet}
				{#snippet title()}
					{$i18n.asset.upload_file}
				{/snippet}
				{#snippet description()}
					<Html
						text={i18nFormat($i18n.asset.upload_description, [
							{
								placeholder: '{0}',
								value: collection ?? ''
							}
						])}
					/>
				{/snippet}
			</AssetUpload>

			<button class="menu" type="button" onclick={load}
				><IconRefresh size="20px" /> {$i18n.core.reload}</button
			>

			<DataCollectionDelete {deleteData}>
				{#snippet button()}
					{$i18n.collections.clear_collection}
				{/snippet}
				{#snippet title()}
					{$i18n.collections.clear_collection}
				{/snippet}
				<Html
					text={i18nFormat($i18n.asset.delete_all, [
						{
							placeholder: '{0}',
							value: collection ?? ''
						}
					])}
				/>
			</DataCollectionDelete>
		{/snippet}
	</DataCollectionHeader>
</div>

{#if $hasAnyRules}
	<div
		class="data"
		class:data-selected={nonNullish($assetsStore?.data)}
		class:data-nullish={isNullish($paginationStore.items)}
	>
		{#if nonNullish($paginationStore.items)}
			<div in:fade>
				{#if $paginationStore.items.length > 0}
					{#each $paginationStore.items as item}
						{@const asset = item[1]}
						{@const key = asset.key.full_path}

						<button class="text action" onclick={() => assetsStore.set({ key, data: asset })}
							><span>{key}</span></button
						>
					{/each}
				{/if}

				{#if !empty}
					<DataPaginator />
				{/if}

				{#if empty}
					<CollectionEmpty {collection} rule={$store.rule?.[1]}>
						{#snippet filter()}
							{$i18n.asset.no_match}
						{/snippet}
					</CollectionEmpty>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/data';

	@include data.list;
</style>
