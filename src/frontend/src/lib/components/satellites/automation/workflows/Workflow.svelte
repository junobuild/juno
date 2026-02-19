<script lang="ts">
	import { notEmptyString } from '@dfinity/utils';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Workflow, WorkflowKey } from '$lib/types/workflow';
	import { toRepositoryKey, toRunId } from '$lib/utils/workflow.utils';

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

{#snippet actorLink({ actor }: { actor: string })}
	<a
		aria-label={$i18n.automation.view_contributor}
		href={`https://github.com/${actor}`}
		rel="noopener noreferrer"
		target="_blank">{actor}</a
	>
{/snippet}

{#snippet workflowDispatch(params: { actor: string })}
	<span>{$i18n.automation.manually_run_by} {@render actorLink(params)}</span>
{/snippet}

{#snippet pullRequest(params: { actor: string })}
	<span>{$i18n.automation.pr_run_by} {@render actorLink(params)}</span>
{/snippet}

{#snippet push({ actor, sha }: { actor: string; sha: string })}
	<span
		>{$i18n.automation.commit}
		<a
			aria-label={$i18n.automation.view_commit}
			href={shaHref}
			rel="noopener noreferrer"
			target="_blank">{sha.slice(0, 7) ?? ''}</a
		>
		{$i18n.automation.pushed_by}
		{@render actorLink({ actor })}</span
	>
{/snippet}

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

		{#if notEmptyString(actor)}
			<p class="event">
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
	.workflow {
		margin: 0 0 var(--padding-0_25x);

		font-weight: var(--font-weight-bold);

		a {
			text-decoration: none;
		}
	}

	.event {
		font-size: var(--font-size-small);
		color: var(--value-color);
	}
</style>
