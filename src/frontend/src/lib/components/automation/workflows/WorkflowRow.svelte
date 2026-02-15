<script lang="ts">
	import { formatToDate } from '$lib/utils/date.utils';
	import type { Workflow as WorkflowType, WorkflowKey } from '$lib/types/workflow';
	import Workflow from '$lib/components/automation/workflows/Workflow.svelte';
	import WorkflowRef from '$lib/components/automation/workflows/WorkflowRef.svelte';

	interface Props {
		key: string;
		workflow: WorkflowType;
	}

	let { key, workflow }: Props = $props();

	let { created_at } = $derived(workflow);
	let workflowKey = $derived(key as WorkflowKey);
</script>

<tr>
	<td class="workflow"><Workflow key={workflowKey} {workflow} /></td>
	<td class="reference"><WorkflowRef key={workflowKey} {workflow} /></td>
	<td class="timestamp">{formatToDate(created_at)}</td>
</tr>

<style lang="scss">
	@use '../../../styles/mixins/media';

	.workflow,
	.reference {
		width: 35%;
	}

	.timestamp {
		width: 30%;
		text-align: right;
	}

	.timestamp {
		display: none;

		@include media.min-width(small) {
			display: table-cell;
		}
	}
</style>
