<script lang="ts">
	import Workflow from '$lib/components/satellites/automation/workflows/Workflow.svelte';
	import type { Workflow as WorkflowType, WorkflowKey } from '$lib/types/workflow';

	interface Props {
		key: WorkflowKey;
		workflow: WorkflowType;
	}

	let { key, workflow }: Props = $props();

	let workflowKey = $derived(key);
</script>

<Workflow key={workflowKey} {workflow} />
