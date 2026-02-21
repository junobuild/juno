<script lang="ts">
	import type { Satellite } from '$lib/types/satellite';
	import type { Workflow, WorkflowKey } from '$lib/types/workflow';
	import SatelliteLastDeploymentsLoader from '$lib/components/satellites/overview/deployments/SatelliteLastDeploymentsLoader.svelte';
	import SatelliteLastDeployment from '$lib/components/satellites/overview/deployments/SatelliteLastDeployment.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { fade } from 'svelte/transition';

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
