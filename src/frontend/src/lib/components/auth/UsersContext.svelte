<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import UsersTable from '$lib/components/auth/Users.svelte';
	import ListContext from '$lib/components/list/ListContext.svelte';
	import type { ListDocsFn } from '$lib/services/satellite/_list-docs.services';
	import { listUsers } from '$lib/services/satellite/user/users.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { User as UserType } from '$lib/types/user';

	interface Props {
		satelliteId: Principal;
	}

	let { satelliteId }: Props = $props();

	const listFn: ListDocsFn<UserType> = listUsers;

	let listContextRef = $state<ListContext<UserType> | undefined>();
	const reload = () => listContextRef?.reload();
</script>

<ListContext bind:this={listContextRef} errorLabel={$i18n.errors.load_users} {listFn} {satelliteId}>
	<UsersTable {reload} {satelliteId} />
</ListContext>
