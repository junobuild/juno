<script lang="ts">
	import { notEmptyString } from '@dfinity/utils';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Workflow, WorkflowKey } from '$lib/types/workflow';
	import { toRepositoryKey } from '$lib/utils/workflow.utils';

	interface Props {
		key: WorkflowKey;
		workflow: Workflow;
	}

	let { key, workflow }: Props = $props();

	let repoKey = $derived(toRepositoryKey(key));

	let { ref } = $derived(workflow.data);

	let refType = $derived<'branch' | 'tag' | 'pull' | undefined>(
		ref?.startsWith('refs/heads/')
			? 'branch'
			: ref?.startsWith('refs/tags/')
				? 'tag'
				: ref?.startsWith('refs/pull/')
					? 'pull'
					: undefined
	);

	let refName = $derived(
		ref
			?.replace('refs/heads/', '')
			.replace('refs/tags/', '')
			.replace(/refs\/pull\/(\d+)\/.*/, '$1') ?? ''
	);

	let pathname = $derived(`${repoKey.owner}/${repoKey.name}`);

	let refHref = $derived(
		refType === 'branch'
			? `https://github.com/${pathname}/tree/${refName}`
			: refType === 'tag'
				? `https://github.com/${pathname}/releases/tag/${refName}`
				: refType === 'pull'
					? `https://github.com/${pathname}/pull/${refName}`
					: undefined
	);
</script>

{#if notEmptyString(refHref)}
	<a
		aria-label={$i18n.automation.view_branch}
		href={refHref}
		rel="noopener noreferrer"
		target="_blank"><Badge color="primary-opaque">{refName}</Badge></a
	>
{/if}

<style lang="scss">
	a {
		text-decoration: none;
	}
</style>
