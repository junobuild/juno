<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import { listUsers } from '$lib/services/satellite/user/users.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { User as UserType } from '$lib/types/user';
	import ListContext from '$lib/components/list/ListContext.svelte';
	import type { ListDocsFn } from '$lib/services/satellite/_list-docs.services';
	import UsersTable from '$lib/components/auth/Users.svelte';

	interface Props {
		satelliteId: Principal;
	}

	let { satelliteId }: Props = $props();

	const listFn: ListDocsFn<UserType> = listUsers;

	let listContextRef = $state<ListContext<UserType> | undefined>();
	const reload = () => listContextRef?.reload();
</script>

<ListContext bind:this={listContextRef} {satelliteId} {listFn} errorLabel={$i18n.errors.load_users}>
	<UsersTable {satelliteId} {reload} />
</ListContext>
