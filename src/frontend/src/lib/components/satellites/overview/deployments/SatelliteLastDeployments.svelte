<script lang="ts">
	import SatelliteLastDeployment from '$lib/components/satellites/overview/deployments/SatelliteLastDeployment.svelte';
	import SatelliteLastDeploymentsLoader from '$lib/components/satellites/overview/deployments/SatelliteLastDeploymentsLoader.svelte';
	import type { Satellite } from '$lib/types/satellite';
	import type { Workflow, WorkflowKey } from '$lib/types/workflow';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();
</script>

<SatelliteLastDeploymentsLoader {satellite}>
	{#snippet content(workflows: [WorkflowKey, Workflow][])}
		{#each workflows as [key, workflow] (key)}
			<SatelliteLastDeployment {key} {workflow} />
		{/each}
	{/snippet}
</SatelliteLastDeploymentsLoader>
