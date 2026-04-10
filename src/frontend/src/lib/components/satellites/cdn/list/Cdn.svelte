<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { getContext } from 'svelte';
	import type { SatelliteDid } from '$declarations';
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';
	import CdnAsset from '$lib/components/satellites/cdn/list/CdnAsset.svelte';
	import CdnFilter from '$lib/components/satellites/cdn/list/CdnFilter.svelte';
	import DataActions from '$lib/components/satellites/data/DataActions.svelte';
	import DataCount from '$lib/components/satellites/data/DataCount.svelte';
	import DataOrder from '$lib/components/satellites/data/DataOrder.svelte';
	import DataPaginator from '$lib/components/satellites/data/DataPaginator.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
		reload: () => void;
	}

	let { satellite, reload }: Props = $props();

	const { store: paginationStore }: PaginationContext<SatelliteDid.AssetNoContent> =
		getContext<PaginationContext<SatelliteDid.AssetNoContent>>(PAGINATION_CONTEXT_KEY);

	let empty = $derived($paginationStore.items?.length === 0);

	let innerWidth = $state(0);

	let colspan = $derived(
		innerWidth >= 1024 ? 5 : innerWidth >= 768 ? 4 : innerWidth >= 576 ? 3 : 2
	);
</script>

<svelte:window bind:innerWidth />

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th {colspan}>
					<div class="actions">
						<CdnFilter />
						<DataOrder />

						<DataActions>
							<button class="menu" onclick={reload} type="button"
								><IconRefresh size="20px" /> {$i18n.core.reload}</button
							>
						</DataActions>
					</div>
				</th>
			</tr>
			<tr>
				<th class="tools"></th>
				<th class="full-path"> {$i18n.asset.full_path} </th>
				<th class="description"> {$i18n.asset.description} </th>
				<th class="created"> {$i18n.core.created} </th>
				<th class="updated"> {$i18n.core.updated} </th>
			</tr>
		</thead>

		<tbody>
			{#if nonNullish($paginationStore.items)}
				{#each $paginationStore.items as [key, asset] (key)}
					<CdnAsset {asset} {satellite} />
				{/each}

				{#if !empty && ($paginationStore.pages ?? 0) > 1}
					<tr><td {colspan}><DataPaginator /></td></tr>
				{/if}

				{#if empty}
					<tr><td {colspan}>{$i18n.cdn.empty}</td></tr>
				{/if}
			{/if}
		</tbody>
	</table>
</div>

<DataCount />

<style lang="scss">
	@use '../../../../styles/mixins/media';

	table {
		table-layout: auto;
	}

	.tools {
		width: 60px;
	}

	.description {
		display: none;

		@include media.min-width(small) {
			display: table-cell;
		}
	}

	.created {
		display: none;

		@include media.min-width(medium) {
			display: table-cell;
		}
	}

	.updated {
		display: none;

		@include media.min-width(large) {
			display: table-cell;
		}
	}

	@include media.min-width(small) {
		.description {
			width: 220px;
		}
	}

	@include media.min-width(large) {
		.full-path {
			width: 350px;
		}

		.description {
			width: inherit;
		}
	}

	.actions {
		display: flex;
		gap: var(--padding-1_5x);
		padding: var(--padding) 0;
	}
</style>
