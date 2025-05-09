<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { getContext, untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { Doc as DocType } from '$declarations/satellite/satellite.did';
	import { deleteDocs } from '$lib/api/satellites.api';
	import CollectionEmpty from '$lib/components/collections/CollectionEmpty.svelte';
	import DataCollectionDelete from '$lib/components/data/DataCollectionDelete.svelte';
	import DataCollectionHeader from '$lib/components/data/DataCollectionHeader.svelte';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';
	import DocUpload from '$lib/components/docs/DocUpload.svelte';
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { listParamsStore } from '$lib/stores/list-params.store';
	import { versionStore } from '$lib/stores/version.store';
	import { DATA_CONTEXT_KEY, type DataContext } from '$lib/types/data.context';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { emit } from '$lib/utils/events.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	const { store, hasAnyRules }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let collection = $derived($store.rule?.[0]);

	const {
		store: paginationStore,
		resetPage,
		list
	}: PaginationContext<DocType> = getContext<PaginationContext<DocType>>(PAGINATION_CONTEXT_KEY);

	let empty = $derived($paginationStore.items?.length === 0 && nonNullish(collection));

	const { store: docsStore, resetData }: DataContext<DocType> =
		getContext<DataContext<DocType>>(DATA_CONTEXT_KEY);

	const load = async () => {
		resetPage();
		resetData();
		await list();
	};

	$effect(() => {
		collection;
		$listParamsStore;
		$versionStore;

		untrack(() => {
			load();
		});
	});

	/**
	 * Delete data
	 */

	let deleteData: (params: { collection: string; satelliteId: Principal }) => Promise<void> =
		$derived(async (params: { collection: string; satelliteId: Principal }) => {
			await deleteDocs({ ...params, identity: $authStore.identity });

			resetData();
		});

	const reload = async () => {
		emit({ message: 'junoCloseActions' });
		await load();
	};
</script>

<div class="title">
	<DataCollectionHeader>
		{$i18n.datastore.documents}

		{#snippet actions()}
			<DocUpload onfileuploaded={reload}>
				{#snippet action()}
					{$i18n.document.create_document}
				{/snippet}
				{#snippet title()}
					{$i18n.document.create_document}
				{/snippet}
				{#snippet description()}
					<Html
						text={i18nFormat($i18n.document.upload_description, [
							{
								placeholder: '{0}',
								value: collection ?? ''
							}
						])}
					/>
				{/snippet}
			</DocUpload>

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
		class:data-selected={nonNullish($docsStore?.data)}
		class:data-nullish={isNullish($paginationStore.items)}
	>
		{#if nonNullish($paginationStore.items)}
			<div in:fade>
				{#if empty}
					<CollectionEmpty {collection} rule={$store.rule?.[1]}>
						{#snippet filter()}
							{$i18n.document.no_match}
						{/snippet}
					</CollectionEmpty>
				{/if}

				{#if $paginationStore.items.length > 0}
					{#each $paginationStore.items as [key, doc] (key)}
						<button class="text action" onclick={() => docsStore.set({ key, data: doc })}
							><span>{key}</span></button
						>
					{/each}
				{/if}

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
