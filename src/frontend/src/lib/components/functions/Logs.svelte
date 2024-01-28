<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { getContext, onMount, setContext } from 'svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import { initPaginationContext } from '$lib/stores/pagination.store';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { listUsers } from '$lib/services/users.services';
	import User from '$lib/components/auth/User.svelte';
	import type { User as UserType } from '$lib/types/user';
	import DataCount from '$lib/components/data/DataCount.svelte';

	export let satelliteId: Principal;

	const list = async () => {
		if (isNullish(satelliteId)) {
			setItems({ items: undefined, matches_length: undefined, items_length: undefined });
			return;
		}

		try {
			const { users, matches_length, items_length } = await listUsers({
				satelliteId,
				startAfter: $paginationStore.startAfter
			});

			setItems({ items: users, matches_length, items_length });
		} catch (err: unknown) {
			toasts.error({
				text: `Error while listing the documents.`,
				detail: err
			});
		}
	};

	setContext<PaginationContext<UserType>>(PAGINATION_CONTEXT_KEY, {
		...initPaginationContext(),
		list
	});
	const { store: paginationStore, setItems }: PaginationContext<UserType> =
		getContext<PaginationContext<UserType>>(PAGINATION_CONTEXT_KEY);

	onMount(async () => await list());

	let empty = false;
	$: empty = $paginationStore.items?.length === 0;
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="time"> {$i18n.functions.time} </th>
				<th class="level"> {$i18n.functions.level} </th>
				<th class="source"> {$i18n.functions.source} </th>
				<th class="msg"> {$i18n.functions.msg} </th>
			</tr>
		</thead>

		<tbody>
			{#if nonNullish($paginationStore.items)}
				{#each $paginationStore.items as [_key, user]}
					<User {user} />
				{/each}

				{#if !empty && ($paginationStore.pages ?? 0) > 1}
					<tr><td colspan="4"><DataPaginator /></td></tr>
				{/if}

				{#if empty}
					<tr><td colspan="4">{$i18n.functions.empty}</td></tr>
				{/if}
			{/if}
		</tbody>
	</table>
</div>

<DataCount />

<style lang="scss">
	@use '../../styles/mixins/media';

	.level,
	.source,
	.time {
		display: none;

		@include media.min-width(medium) {
			display: table-header-group;
		}
	}

	.msg {
		width: 100%;
	}

	@include media.min-width(medium) {
		.msg {
			width: 360px;
		}

		.time {
			width: 220px;
		}

		.time,
		.level,
		.source {
			display: table-cell;
		}
	}

	@include media.min-width(large) {
		.msg {
			width: 500px;
		}

		.level {
			width: inherit;
		}

		.time {
			display: table-cell;
		}
	}
</style>
