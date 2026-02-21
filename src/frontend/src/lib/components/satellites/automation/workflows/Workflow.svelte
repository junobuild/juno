<script lang="ts">
	import { notEmptyString } from '@dfinity/utils';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Workflow, WorkflowKey } from '$lib/types/workflow';
	import { toRepositoryKey, toRunId } from '$lib/utils/workflow.utils';
	import WorkflowActor from '$lib/components/satellites/automation/workflows/WorkflowActor.svelte';

	interface Props {
		key: WorkflowKey;
		workflow: Workflow;
	}

	let { key, workflow }: Props = $props();

	let { workflow: workflowName, runNumber, actor } = $derived(workflow.data);

	let repoKey = $derived(toRepositoryKey(key));
	let runId = $derived(toRunId(key));

	let runIdHref = $derived(
		`https://github.com/${repoKey.owner}/${repoKey.name}/actions/runs/${runId ?? ''}`
	);
</script>

{#if notEmptyString(workflowName) || notEmptyString(actor)}
	<div>
		{#if notEmptyString(workflowName)}
			<p class="workflow">
				{workflowName}
				{#if notEmptyString(runNumber)}(<a
						aria-label={$i18n.automation.view_workflow}
						href={runIdHref}
						rel="noopener noreferrer"
						target="_blank">#{runNumber}</a
					>){/if}
			</p>
		{/if}

		<WorkflowActor {repoKey} {workflow} />
	</div>
{:else}
	<p>{$i18n.automation.no_workflow_info}</p>
{/if}

<style lang="scss">
	.workflow {
		margin: 0 0 var(--padding-0_25x);

		font-weight: var(--font-weight-bold);

		a {
			text-decoration: none;
		}
	}
</style>
