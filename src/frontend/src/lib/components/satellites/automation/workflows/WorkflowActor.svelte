<script lang="ts">
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Workflow } from '$lib/types/workflow';
	import { notEmptyString } from '@dfinity/utils';
	import type { SatelliteDid } from '$declarations';
	import {formatToRelativeTime} from "$lib/utils/date.utils";

	interface Props {
		repoKey: SatelliteDid.RepositoryKey;
		workflow: Workflow;
		withTime?: boolean;
	}

	let { repoKey, workflow, withTime = false }: Props = $props();

	let { created_at } = $derived(workflow);
	let { sha, eventName, actor } = $derived(workflow.data);

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
		{@render actorLink({ actor })}{withTime ? ` (${formatToRelativeTime(created_at)})` : ""}</span
	>
{/snippet}

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

<style lang="scss">
	.event {
		font-size: var(--font-size-small);
		color: var(--value-color);
	}
</style>
