<script lang="ts">
	import DataCollectionHeader from '$lib/components/data/DataCollectionHeader.svelte';
	import { listParamsStore } from '$lib/stores/data.store';
	import CollectionEmpty from '$lib/components/collections/CollectionEmpty.svelte';
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { getContext } from 'svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';
	import { fade } from 'svelte/transition';
	import type { Doc as DocType } from '$declarations/satellite/satellite.did';
	import { deleteDocs } from '$lib/api/satellites.api';
	import DataCollectionDelete from '$lib/components/data/DataCollectionDelete.svelte';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';
	import DocUpload from '$lib/components/docs/DocUpload.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { DATA_CONTEXT_KEY, type DataContext } from '$lib/types/data.context';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { emit } from '$lib/utils/events.utils';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let collection: string | undefined;
	$: collection = $store.rule?.[0];

	const {
		store: paginationStore,
		resetPage,
		list
	}: PaginationContext<DocType> = getContext<PaginationContext<DocType>>(PAGINATION_CONTEXT_KEY);

	let empty = false;
	$: empty = $paginationStore.items?.length === 0 && nonNullish(collection);

	const { store: docsStore, resetData }: DataContext<DocType> =
		getContext<DataContext<DocType>>(DATA_CONTEXT_KEY);

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
		await deleteDocs({ ...params, identity: $authStore.identity });

		resetData();
	};

	const reload = async () => {
		emit({ message: 'junoCloseActions' });
		await load();
	};
</script>

<div class="title">
	<DataCollectionHeader>
		{$i18n.datastore.documents}

		<svelte:fragment slot="actions">
			<DocUpload on:junoUploaded={reload}>
				<svelte:fragment slot="action">{$i18n.document.create_document}</svelte:fragment>
				<svelte:fragment slot="title">{$i18n.document.create_document}</svelte:fragment>
				{@html i18nFormat($i18n.document.upload_description, [
					{
						placeholder: '{0}',
						value: collection ?? ''
					}
				])}
			</DocUpload>

			<button class="menu" type="button" on:click={load}
				><IconRefresh size="20px" /> {$i18n.core.reload}</button
			>

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
		class:data-selected={nonNullish($docsStore?.data)}
		class:data-nullish={isNullish($paginationStore.items)}
	>
		{#if nonNullish($paginationStore.items)}
			<div out:fade>
				{#if empty}
					<CollectionEmpty {collection} rule={$store.rule?.[1]}>
						<svelte:fragment slot="filter">{$i18n.document.no_match}</svelte:fragment>
					</CollectionEmpty>
				{/if}

				{#each $paginationStore.items as [key, doc]}
					<button class="text action" on:click={() => docsStore.set({ key, data: doc })}
						><span>{key}</span></button
					>
				{/each}

				{#if !empty}
					<DataPaginator />
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/data';

	@include data.list;
</style>
