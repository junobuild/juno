<script lang="ts">
	import Workflow from '$lib/components/satellites/automation/workflows/Workflow.svelte';
	import WorkflowRef from '$lib/components/satellites/automation/workflows/WorkflowRef.svelte';
	import type { Workflow as WorkflowType, WorkflowKey } from '$lib/types/workflow';
	import { formatToDate } from '$lib/utils/date.utils';

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
	@use '../../../../styles/mixins/media';

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
