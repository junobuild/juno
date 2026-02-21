<script lang="ts">
	import type { Workflow as WorkflowType, WorkflowKey } from '$lib/types/workflow';
	import Workflow from '$lib/components/satellites/automation/workflows/Workflow.svelte';

	interface Props {
		key: WorkflowKey;
		workflow: WorkflowType;
	}

	let { key, workflow }: Props = $props();

	let workflowKey = $derived(key as WorkflowKey);
</script>

<Workflow key={workflowKey} {workflow} />
