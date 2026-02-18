<script lang="ts">
	import type { SatelliteDid } from '$declarations';
	import WorkflowsContext from '$lib/components/satellites/automation/workflows/WorkflowsContext.svelte';
	import SatelliteAutomationConfigGuard from '$lib/components/satellites/automation/guards/SatelliteAutomationConfigGuard.svelte';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();
</script>

<SatelliteAutomationConfigGuard {satellite}>
	{#snippet content(_config: SatelliteDid.AutomationConfig)}
		<WorkflowsContext {satellite} />
	{/snippet}
</SatelliteAutomationConfigGuard>
