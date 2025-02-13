<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { getContext, onMount, setContext } from 'svelte';
	import { run } from 'svelte/legacy';
	import User from '$lib/components/auth/User.svelte';
	import DataCount from '$lib/components/data/DataCount.svelte';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';
	import { listUsers } from '$lib/services/users.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { initPaginationContext } from '$lib/stores/pagination.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import type { User as UserType } from '$lib/types/user';

	interface Props {
		satelliteId: Principal;
	}

	let { satelliteId }: Props = $props();

	const list = async () => {
		if (isNullish(satelliteId)) {
			setItems({ items: undefined, matches_length: undefined, items_length: undefined });
			return;
		}

		try {
			const { users, matches_length, items_length } = await listUsers({
				satelliteId,
				startAfter: $startAfter
			});

			setItems({ items: users, matches_length, items_length });
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.load_users,
				detail: err
			});
		}
	};

	setContext<PaginationContext<UserType>>(PAGINATION_CONTEXT_KEY, {
		...initPaginationContext(),
		list
	});

	const {
		store: paginationStore,
		setItems,
		startAfter
	}: PaginationContext<UserType> = getContext<PaginationContext<UserType>>(PAGINATION_CONTEXT_KEY);

	onMount(async () => await list());

	let empty = $derived($paginationStore.items?.length === 0);
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="tools"></th>
				<th class="identifier"> {$i18n.users.identifier} </th>
				<th class="providers"> {$i18n.users.provider} </th>
				<th class="created"> {$i18n.users.created} </th>
			</tr>
		</thead>

		<tbody>
			{#if nonNullish($paginationStore.items)}
				{#each $paginationStore.items as [_key, user]}
					<User {user} {satelliteId} />
				{/each}

				{#if !empty && ($paginationStore.pages ?? 0) > 1}
					<tr><td colspan="5"><DataPaginator /></td></tr>
				{/if}

				{#if empty}
					<tr><td colspan="5">{$i18n.users.empty}</td></tr>
				{/if}
			{/if}
		</tbody>
	</table>
</div>

<DataCount />

<style lang="scss">
	@use '../../styles/mixins/media';

	.tools {
		width: 60px;
	}

	.providers {
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

	@include media.min-width(small) {
		.providers {
			width: 220px;
		}
	}

	@include media.min-width(large) {
		.identifier {
			width: 300px;
		}

		.providers {
			width: inherit;
		}
	}
</style>
