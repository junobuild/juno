<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { getContext, onMount, setContext } from 'svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import type { Doc as DocType } from '$declarations/satellite/satellite.did';
	import { initPaginationContext } from '$lib/stores/pagination.store';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { listUsers } from '$lib/services/users.services';
	import User from '$lib/components/auth/User.svelte';

	export let satelliteId: Principal;

	const list = async () => {
		if (isNullish(satelliteId)) {
			setItems({ items: undefined, matches_length: undefined });
			return;
		}

		try {
			const { users, matches_length } = await listUsers({
				satelliteId,
				startAfter: $paginationStore.startAfter
			});

			setItems({ items: users, matches_length });
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
				<th class="identifier"> {$i18n.users.identifier} </th>
				<th class="providers"> {$i18n.users.providers} </th>
				<th class="created"> {$i18n.users.created} </th>
				<th class="updated"> {$i18n.users.updated} </th>
			</tr>
		</thead>

		<tbody>
			{#if nonNullish($paginationStore.items)}
				{#each $paginationStore.items as [_key, user]}
					<User {user} />
				{/each}

				{#if !empty && ($paginationStore.pages ?? 0) > 0}
					<tr><td colspan="4"><DataPaginator /></td></tr>
				{/if}

				{#if empty}
					<tr><td colspan="4">{$i18n.users.empty}</td></tr>
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
			width: 260px;
		}

		.providers {
			width: 120px;
		}

		.providers,
		.created {
			display: table-cell;
		}
	}

	@include media.min-width(large) {
		.identifier {
			width: 300px;
		}

		.providers {
			width: inherit;
		}

		.updated {
			display: table-cell;
		}
	}
</style>
