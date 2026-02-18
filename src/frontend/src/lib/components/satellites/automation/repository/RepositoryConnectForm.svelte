<script lang="ts">
	import type { SatelliteDid } from '$declarations';
	import { buildRepositoryKey } from '$lib/services/satellite/automation/automation.config.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { isEmptyString, notEmptyString } from '@dfinity/utils';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { onMount } from 'svelte';

	interface Props {
		repoUrlInput: string;
		repoReferencesInput: string;
		oncontinue: (params: {
			repoKey: SatelliteDid.RepositoryKey;
			repoReferences: [string, ...string[]] | undefined;
		}) => void;
	}

	let {
		oncontinue,
		repoUrlInput = $bindable(''),
		repoReferencesInput = $bindable('')
	}: Props = $props();

	const onSubmit = ($event: SubmitEvent) => {
		$event.preventDefault();

		const result = buildRepositoryKey({ repoUrl: repoUrlInput });

		if (result.result === 'error') {
			return;
		}

		const { repoKey } = result;

		const repoReferences = notEmptyString(repoReferencesInput)
			? repoReferencesInput.split(',')
			: undefined;

		const invalidReferences = (repoReferences ?? []).filter(
			(ref) =>
				!ref.startsWith('refs/heads/') &&
				!ref.startsWith('refs/tags/') &&
				!ref.startsWith('refs/pull/')
		);

		if (invalidReferences.length > 0) {
			toasts.error({
				text: $i18n.errors.repo_references_invalid
			});
			return;
		}

		oncontinue({
			repoKey,
			repoReferences:
				(repoReferences?.length ?? 0) > 0 ? (repoReferences as [string, ...string[]]) : undefined
		});
	};

	let collapsibleRef: Collapsible | undefined = $state(undefined);

	onMount(() => {
		if (isEmptyString(repoReferencesInput)) {
			return;
		}

		collapsibleRef?.open();
	});
</script>

<h2>{$i18n.automation.create_connect_title}</h2>

<p>{$i18n.automation.create_connect_description}</p>

<form onsubmit={onSubmit}>
	<input
		name="repo_url"
		autocomplete="off"
		data-1p-ignore
		placeholder={$i18n.automation.create_connect_input_placeholder}
		type="text"
		bind:value={repoUrlInput}
	/>

	<Collapsible bind:this={collapsibleRef}>
		{#snippet header()}
			{$i18n.core.advanced_options}
		{/snippet}

		<div>
			<Value>
				{#snippet label()}
					{$i18n.automation.references}
				{/snippet}

				<Input
					name="destination"
					inputType="text"
					placeholder={$i18n.automation.references_placeholder}
					required={false}
					bind:value={repoReferencesInput}
				/>
			</Value>
		</div>
	</Collapsible>

	<button type="submit">{$i18n.core.continue}</button>
</form>
