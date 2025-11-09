<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import type { Principal } from '@icp-sdk/core/principal';
	import { getContext, setContext, untrack } from 'svelte';
	import UserFilter from '$lib/components/auth/UserFilter.svelte';
	import UserRow from '$lib/components/auth/UserRow.svelte';
	import DataActions from '$lib/components/data/DataActions.svelte';
	import DataCount from '$lib/components/data/DataCount.svelte';
	import DataOrder from '$lib/components/data/DataOrder.svelte';
	import DataPaginator from '$lib/components/data/DataPaginator.svelte';
	import IconRefresh from '$lib/components/icons/IconRefresh.svelte';
	import { listUsers } from '$lib/services/user/users.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { initListParamsContext } from '$lib/stores/list-params.context.store';
	import { initPaginationContext } from '$lib/stores/pagination.context.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';
	import {
		LIST_PARAMS_CONTEXT_KEY,
		ListParamsKey,
		type ListParamsContext
	} from '$lib/types/list-params.context';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import type { User as UserType } from '$lib/types/user';
	import { emit } from '$lib/utils/events.utils';

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
				filter: $listParams.filter,
				order: $listParams.order,
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

	setContext<ListParamsContext>(
		LIST_PARAMS_CONTEXT_KEY,
		initListParamsContext(ListParamsKey.USERS)
	);

	const { listParams } = getContext<ListParamsContext>(LIST_PARAMS_CONTEXT_KEY);

	$effect(() => {
		$versionStore;
		$listParams;

		untrack(() => {
			list();
		});
	});

	const reload = () => {
		// Not awaited on purpose, we want to close the popover no matter what
		list();

		emit({ message: 'junoCloseActions' });
	};

	let empty = $derived($paginationStore.items?.length === 0);

	let innerWidth = $state(0);

	let colspan = $derived(
		innerWidth >= 1024 ? 6 : innerWidth >= 768 ? 5 : innerWidth >= 576 ? 4 : 2
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
				<th class="identifier"> {$i18n.users.identifier} </th>
				<th class="providers"> {$i18n.users.provider} </th>
				<th class="user"> {$i18n.users.user} </th>
				<th class="email"> {$i18n.users.email} </th>
				<th class="created"> {$i18n.core.created} </th>
			</tr>
		</thead>

		<tbody>
			{#if nonNullish($paginationStore.items)}
				{#each $paginationStore.items as [key, user] (key)}
					<UserRow {satelliteId} {user} />
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

	.user {
		display: none;

		@include media.min-width(small) {
			display: table-cell;
		}
	}

	.user,
	.email {
		max-width: 200px;
	}

	.created,
	.email {
		display: none;

		@include media.min-width(large) {
			display: table-cell;
		}
	}

	.user {
		@include media.min-width(small) {
			width: 50%;
		}

		@include media.min-width(large) {
			width: inherit;
		}
	}

	@include media.min-width(large) {
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
