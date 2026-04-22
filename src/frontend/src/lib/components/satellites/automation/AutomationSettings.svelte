<script lang="ts">
	import type { SatelliteDid } from '$declarations';
	import GitHubConfigGuard from '$lib/components/satellites/automation/guards/GitHubConfigGuard.svelte';
	import AutomationConfig from '$lib/components/satellites/automation/settings/AutomationConfig.svelte';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();
</script>

<GitHubConfigGuard {satellite}>
	{#snippet content(config: SatelliteDid.OpenIdAutomationProviderConfig)}
		<AutomationConfig {config} {satellite} />
	{/snippet}
</GitHubConfigGuard>
