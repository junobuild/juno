<script lang="ts">
	import type { SatelliteDid } from '$declarations';
	import GitHubConfigGuard from '$lib/components/satellites/automation/guards/GitHubConfigGuard.svelte';
	import AutomationKeysSettings from '$lib/components/satellites/automation/settings/AutomationKeysSettings.svelte';
	import type { Satellite } from '$lib/types/satellite';
	import GitHubSettings from "$lib/components/satellites/automation/settings/GitHubSettings.svelte";

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();
</script>

<GitHubConfigGuard {satellite}>
	{#snippet content(config: SatelliteDid.OpenIdAutomationProviderConfig)}
		<GitHubSettings {config} {satellite} />

		<AutomationKeysSettings {config} {satellite} />
	{/snippet}
</GitHubConfigGuard>
