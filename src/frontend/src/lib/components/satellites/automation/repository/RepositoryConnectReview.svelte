<script lang="ts">
	import type { SatelliteDid } from '$declarations';
	import IconCodeBranch from '$lib/components/icons/IconCodeBranch.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { nonNullish } from '@dfinity/utils';
	import RepositoryRef from "$lib/components/satellites/automation/repository/RepositoryRef.svelte";

	interface Props {
		repoKey: SatelliteDid.RepositoryKey;
		repoReferences: [string, ...string[]] | undefined;
		onback: () => void;
		onconfirm: (params: { repoKey: SatelliteDid.RepositoryKey }) => Promise<void>;
	}

	let { repoKey, repoReferences, onback, onconfirm }: Props = $props();

	let repo = $derived(`${repoKey.owner}/${repoKey.name}`);
	let href = $derived(`https://github.com/${repo}`);

	const onClick = async () => {
		await onconfirm({ repoKey });
	};
</script>

<h2>{$i18n.automation.create_connect_review_title}</h2>

<p>{$i18n.automation.create_connect_review_description}</p>

<Value>
	{#snippet label()}
		{$i18n.automation.repository}
	{/snippet}

	<p>
		<span class="repo">{repo}</span>
		<a
			class="link"
			aria-label={$i18n.automation.open_repo}
			{href}
			rel="noopener noreferrer"
			target="_blank"><IconCodeBranch size="16px" /><span>main</span></a
		>
	</p>
</Value>

{#if nonNullish(repoReferences)}
	<Value>
		{#snippet label()}
			{$i18n.automation.references}
		{/snippet}

		<p class="refs">
			{#each repoReferences as ref (ref)}
				<RepositoryRef key={repoKey} {ref} />
			{/each}
		</p>
	</Value>
{/if}

<div class="toolbar">
	<button onclick={onback} type="button">{$i18n.core.back}</button>
	<button onclick={onClick} type="button">{$i18n.core.confirm}</button>
</div>

<style lang="scss">
	.repo {
		display: inline-block;
		padding: 0 0 1px;
	}

	.link {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		gap: var(--padding);

		vertical-align: bottom;

		margin: 0 0 0 var(--padding-2x);
	}

	.refs {
		display: flex;
		flex-wrap: wrap;
		gap: var(--padding);

		margin: var(--padding) 0 var(--padding-3x);
	}
</style>
