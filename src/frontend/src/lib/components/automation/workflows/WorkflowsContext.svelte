<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import UsersTable from '$lib/components/auth/Users.svelte';
	import ListContext from '$lib/components/list/ListContext.svelte';
	import type { ListDocsFn } from '$lib/services/satellite/_list-docs.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Workflow } from '$lib/types/workflow';
	import { listWorkflows } from '$lib/services/satellite/automation/workflows.services';
	import Workflows from "$lib/components/automation/workflows/Workflows.svelte";

	interface Props {
		satelliteId: Principal;
	}

	let { satelliteId }: Props = $props();

	const listFn: ListDocsFn<Workflow> = listWorkflows;

	let listContextRef = $state<ListContext<Workflow> | undefined>();
	const reload = () => listContextRef?.reload();
</script>

<ListContext bind:this={listContextRef} errorLabel={$i18n.errors.load_users} {listFn} {satelliteId}>
	<Workflows {reload} {satelliteId} />
</ListContext>
