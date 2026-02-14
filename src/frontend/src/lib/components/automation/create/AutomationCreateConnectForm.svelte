<script lang="ts">
	import type { SatelliteDid } from '$declarations';
	import { buildRepositoryKey } from '$lib/services/satellite/automation.config.services';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		repoUrl: string;
		oncontinue: (params: { repoKey: SatelliteDid.RepositoryKey }) => void;
	}

	let { oncontinue, repoUrl = $bindable('') }: Props = $props();

	const onSubmit = ($event: SubmitEvent) => {
		$event.preventDefault();

		const result = buildRepositoryKey({ repoUrl });

		if (result.result === 'error') {
			return;
		}

		const { repoKey } = result;

		oncontinue({ repoKey });
	};
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
		bind:value={repoUrl}
	/>

	<button type="submit">{$i18n.core.continue}</button>
</form>
