<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { getContext, setContext, untrack } from 'svelte';
	import User from '$lib/components/auth/User.svelte';
	import UserFilter from '$lib/components/auth/UserFilter.svelte';
	import DataCount from '$lib/components/data/DataCount.svelte';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';
	import { listUsers } from '$lib/services/user/users.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { listParamsStore } from '$lib/stores/list-params.store';
	import { initPaginationContext } from '$lib/stores/pagination.context.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';
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

		const version = $versionStore?.satellites[satelliteId.toText()]?.current;

		if (isNullish(version)) {
			setItems({ items: undefined, matches_length: undefined, items_length: undefined });
			return;
		}

		try {
			const { users, matches_length, items_length } = await listUsers({
				satelliteId,
				startAfter: $startAfter,
				filter: $listParamsStore.filter,
				identity: $authStore.identity
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
				<th {colspan}>
					<div class="actions">
						<UserFilter />
					</div>
				</th>
			</tr>
			<tr>
				<th class="tools"></th>
				<th class="identifier"> {$i18n.users.identifier} </th>
				<th class="providers"> {$i18n.users.provider} </th>
				<th class="created"> {$i18n.core.created} </th>
				<th class="updated"> {$i18n.core.updated} </th>
			</tr>
		</thead>

		<tbody>
			{#if nonNullish($paginationStore.items)}
				{#each $paginationStore.items as [key, user] (key)}
					<User {satelliteId} {user} />
				{/each}

				{#if !empty && ($paginationStore.pages ?? 0) > 1}
					<tr><td {colspan}><DataPaginator /></td></tr>
				{/if}

				{#if empty}
					<tr><td {colspan}>{$i18n.users.empty}</td></tr>
				{/if}
			{/if}
		</tbody>
	</table>
</div>

<DataCount />

<style lang="scss">
	@use '../../styles/mixins/media';

	table {
		table-layout: auto;
	}

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

	.updated {
		display: none;

		@include media.min-width(large) {
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

	.actions {
		display: flex;
		gap: var(--padding-1_5x);
		padding: var(--padding) 0;
	}
</style>
