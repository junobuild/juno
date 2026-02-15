<script lang="ts">
	import type { Workflow, WorkflowKey } from '$lib/types/workflow';
	import { toRepositoryKey, toRunId } from '$lib/utils/workflow.utils';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { notEmptyString } from '@dfinity/utils';

	interface Props {
		key: WorkflowKey;
		workflow: Workflow;
	}

	let { key, workflow }: Props = $props();

	let { workflow: workflowName, runNumber, sha, eventName, actor } = $derived(workflow.data);

	let repoKey = $derived(toRepositoryKey(key));
	let runId = $derived(toRunId(key));

	let runIdHref = $derived(
		`https://github.com/${repoKey.owner}/${repoKey.name}/actions/runs/${runId ?? ''}`
	);

	let shaHref = $derived(`https://github.com/${repoKey.owner}/${repoKey.name}/commit/${sha ?? ''}`);
</script>

{#snippet workflowDispatch({ actor }: { actor: string })}
	<span>{$i18n.automation.manually_run_by} {actor}</span>
{/snippet}

{#snippet pullRequest({ actor }: { actor: string })}
	<span>{$i18n.automation.pr_run_by} {actor}</span>
{/snippet}

{#snippet push({ actor, sha }: { actor: string; sha: string })}
	<span
		>{$i18n.automation.commit}
		<a
			href={shaHref}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={$i18n.automation.view_commit}>{sha.slice(0, 7) ?? ''}</a
		>
		{$i18n.automation.pushed_by}
		{actor}</span
	>
{/snippet}

{#if notEmptyString(workflowName) || notEmptyString(actor)}
	<div>
		{#if notEmptyString(workflowName)}
			<p>
				{workflowName}
				{#if notEmptyString(runNumber)}<a
						href={runIdHref}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={$i18n.automation.view_workflow}>#{runNumber}</a
					>{/if}
			</p>
		{/if}

		{#if notEmptyString(actor)}
			<p>
				{#if eventName === 'workflow_dispatch'}
					{@render workflowDispatch({ actor })}
				{:else if eventName === 'pull_request'}
					{@render pullRequest({ actor })}
				{:else if notEmptyString(sha)}
					{@render push({ actor, sha })}
				{/if}
			</p>
		{/if}
	</div>
{:else}
	<p>{$i18n.automation.no_workflow_info}</p>
{/if}

<style lang="scss">
	p {
		margin: 0;
	}
</style>
