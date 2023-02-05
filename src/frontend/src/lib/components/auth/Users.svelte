<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { listDocs } from '$lib/api/satellites.api';
	import { getContext, onMount, setContext } from 'svelte';
	import { formatToDate } from '$lib/utils/date.utils';
	import IconIC from '$lib/components/icons/IconIC.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import type { Doc as DocType } from '$declarations/satellite/satellite.did';
	import { initPaginationContext } from '$lib/stores/pagination.store';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';

	export let satelliteId: Principal;

	const list = async () => {
		if (isNullish(satelliteId)) {
			setItems({ items: undefined, matches_length: undefined });
			return;
		}

		try {
			const { items, matches_length } = await listDocs({
				collection: '#user',
				satelliteId,
				startAfter: $paginationStore.startAfter
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
	const { store: paginationStore, setItems }: PaginationContext<DocType> =
		getContext<PaginationContext<DocType>>(PAGINATION_CONTEXT_KEY);

	onMount(async () => await list());

	let empty = false;
	$: empty = $paginationStore.items?.length === 0;
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="identifier"> Identifier </th>
				<th class="providers"> <span>Providers</span> </th>
				<th class="created"> Created </th>
				<th class="updated"> Updated </th>
			</tr>
		</thead>

		<tbody>
			{#if nonNullish($paginationStore.items)}
				{#each $paginationStore.items as [_key, { created_at, updated_at, owner }]}
					<tr>
						<td><Identifier identifier={owner.toText()} /></td>
						<td class="providers"><IconIC title="Internet Identity" /></td>
						<td class="created">{formatToDate(created_at)}</td>
						<td class="updated">{formatToDate(updated_at)}</td>
					</tr>
				{/each}

				{#if !empty && ($paginationStore.pages ?? 0) > 0}
					<tr><td colspan="4"><DataPaginator /></td></tr>
				{/if}

				{#if empty}
					<tr><td colspan="4">No registered users at the moment.</td></tr>
				{/if}
			{/if}
		</tbody>
	</table>
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	.providers,
	.created,
	.updated {
		display: none;

		@include media.min-width(medium) {
			display: table-header-group;
		}
	}

	.identifier {
		width: 100%;
	}

	@include media.min-width(medium) {
		.identifier {
			width: 280px;
		}

		.providers,
		.created {
			display: table-cell;
		}
	}

	@include media.min-width(large) {
		.updated {
			display: table-cell;
		}
	}
</style>
