<script lang="ts">
	import type { Workflow, WorkflowKey } from '$lib/types/workflow';
	import { toRepositoryKey } from '$lib/utils/workflow.utils';
	import RepositoryRef from '$lib/components/satellites/automation/RepositoryRef.svelte';

	interface Props {
		key: WorkflowKey;
		workflow: Workflow;
	}

	let { key, workflow }: Props = $props();

	let repoKey = $derived(toRepositoryKey(key));

	let { ref } = $derived(workflow.data);
</script>

<RepositoryRef key={repoKey} {ref} />
