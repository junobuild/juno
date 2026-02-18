<script lang="ts">
	import type { Satellite } from '$lib/types/satellite';
	import type { SatelliteDid } from '$declarations';
	import { fromNullable, isNullish } from '@dfinity/utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import AutomationConfigGuard from '$lib/components/satellites/automation/guards/AutomationConfigGuard.svelte';
	import WorkflowsContext from '$lib/components/satellites/automation/workflows/WorkflowsContext.svelte';
	import GitHubConfigGuard from '$lib/components/satellites/automation/guards/GitHubConfigGuard.svelte';
	import GitHubSettings from '$lib/components/satellites/automation/settings/GitHubSettings.svelte';
    import AutomationKeysSettings from "$lib/components/satellites/automation/settings/AutomationKeysSettings.svelte";

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();
</script>

<GitHubConfigGuard {satellite}>
	{#snippet content(config: SatelliteDid.OpenIdAutomationProviderConfig)}
        <AutomationKeysSettings {satellite} {config} />
        
		<GitHubSettings {satellite} {config} />
	{/snippet}
</GitHubConfigGuard>
