<script lang="ts">
	import Workflows from '$lib/components/satellites/automation/workflows/Workflows.svelte';
	import ListContext from '$lib/components/satellites/list/ListContext.svelte';
	import type { ListDocsFn } from '$lib/services/satellite/_list-docs.services';
	import { listWorkflows } from '$lib/services/satellite/automation/workflows.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { type ListParamsData, ListParamsKey } from '$lib/types/list-params.context';
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

	// By default, we want the last deploys at the top
	const defaultListParams: ListParamsData = {
		order: { desc: true, field: 'keys' },
		filter: {}
	};
</script>

<ListContext
	bind:this={listContextRef}
	{defaultListParams}
	errorLabel={$i18n.errors.load_users}
	{listFn}
	listKey={ListParamsKey.WORKFLOWS}
	{satelliteId}
>
	<Workflows {reload} />
</ListContext>
