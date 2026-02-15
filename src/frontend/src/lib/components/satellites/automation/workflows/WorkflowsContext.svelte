<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import UsersTable from '$lib/components/satellites/auth/Users.svelte';
	import Workflows from '$lib/components/satellites/automation/workflows/Workflows.svelte';
	import ListContext from '$lib/components/satellites/list/ListContext.svelte';
	import type { ListDocsFn } from '$lib/services/satellite/_list-docs.services';
	import { listWorkflows } from '$lib/services/satellite/automation/workflows.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Satellite } from '$lib/types/satellite';
	import type { Workflow } from '$lib/types/workflow';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id);

	const listFn: ListDocsFn<Workflow> = listWorkflows;

	let listContextRef = $state<ListContext<Workflow> | undefined>();
	const reload = () => listContextRef?.reload();
</script>

<ListContext bind:this={listContextRef} errorLabel={$i18n.errors.load_users} {listFn} {satelliteId}>
	<Workflows {reload} />
</ListContext>
