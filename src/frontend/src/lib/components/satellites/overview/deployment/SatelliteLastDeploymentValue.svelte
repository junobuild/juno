<script lang="ts">
	import type { Workflow, WorkflowKey } from '$lib/types/workflow';
	import WorkflowActor from '$lib/components/satellites/automation/workflows/WorkflowActor.svelte';
	import { toRepositoryKey } from '$lib/utils/workflow.utils';
	import { notEmptyString } from '@dfinity/utils';
	import Value from '$lib/components/ui/Value.svelte';
    import {i18n} from "$lib/stores/app/i18n.store";
    import { fade } from 'svelte/transition';
    import {formatToRelativeTime} from "$lib/utils/date.utils";

	interface Props {
		key: WorkflowKey;
		workflow: Workflow;
	}

	let { key, workflow }: Props = $props();

	let repoKey = $derived(toRepositoryKey(key));

	let { actor } = $derived(workflow.data);
</script>

{#if notEmptyString(actor)}
	<div in:fade>
        <Value>
            {#snippet label()}
                {$i18n.automation.last_deployment}
            {/snippet}

            <WorkflowActor {repoKey} {workflow} withTime />
        </Value>
    </div>
{/if}
