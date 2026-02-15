<script lang="ts">
	import WorkflowsContext from '$lib/components/satellites/automation/workflows/WorkflowsContext.svelte';
	import type { Satellite } from '$lib/types/satellite';
	import type { SatelliteDid } from '$declarations';
	import SatelliteAutomationConfigGuard from '$lib/components/satellites/guards/SatelliteAutomationConfigGuard.svelte';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();
</script>

<SatelliteAutomationConfigGuard {satellite}>
	{#snippet content(config: SatelliteDid.AutomationConfig)}
		<WorkflowsContext {satellite} />
	{/snippet}
</SatelliteAutomationConfigGuard>
