<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { getContext, setContext, untrack } from 'svelte';
	import type { SatelliteDid, MissionControlDid } from '$declarations';
	import CdnAsset from '$lib/components/cdn/list/CdnAsset.svelte';
	import DataCount from '$lib/components/data/DataCount.svelte';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';
	import { listWasmAssets } from '$lib/services/proposals/proposals.cdn.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { getListParamsStore, StoreContainers } from '$lib/stores/list-params.store';
	import { initPaginationContext } from '$lib/stores/pagination.context.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';

	interface Props {
		satellite: MissionControlDid.Satellite;
	}

	let { satellite }: Props = $props();
	const listParamsStore = getListParamsStore(StoreContainers.CDN);

	const list = async () => {
		if (isNullish(satellite)) {
			setItems({ items: undefined, matches_length: undefined, items_length: undefined });
			return;
		}

		const version = $versionStore?.satellites[satellite.satellite_id.toText()]?.current;

		if (isNullish(version)) {
			setItems({ items: undefined, matches_length: undefined, items_length: undefined });
			return;
		}

		if (isNullish($authStore.identity)) {
			setItems({ items: undefined, matches_length: undefined, items_length: undefined });

			toasts.error({
				text: $i18n.authentication.not_signed_in
			});
			return;
		}

		try {
			const { items, matches_length, items_length } = await listWasmAssets({
				satelliteId: satellite.satellite_id,
				startAfter: $startAfter,
				identity: $authStore.identity
			});

			setItems({ items, matches_length, items_length });
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.load_users,
				detail: err
			});
		}
	};

	setContext<PaginationContext<SatelliteDid.AssetNoContent>>(PAGINATION_CONTEXT_KEY, {
		...initPaginationContext(),
		list
	});

	const {
		store: paginationStore,
		setItems,
		startAfter
	}: PaginationContext<SatelliteDid.AssetNoContent> = getContext<
		PaginationContext<SatelliteDid.AssetNoContent>
	>(PAGINATION_CONTEXT_KEY);

	$effect(() => {
		$versionStore;
		$listParamsStore;

		untrack(() => {
			list();
		});
	});

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
	@use '../../../styles/mixins/media';

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
