<script lang="ts">
	import type { SatelliteDid } from '$declarations';
	import AutomationConfigGuard from '$lib/components/satellites/automation/guards/AutomationConfigGuard.svelte';
	import WorkflowsContext from '$lib/components/satellites/automation/workflows/WorkflowsContext.svelte';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();
</script>

<AutomationConfigGuard {satellite}>
	{#snippet content(_config: SatelliteDid.AutomationConfig)}
		<WorkflowsContext {satellite} />
	{/snippet}
</AutomationConfigGuard>
