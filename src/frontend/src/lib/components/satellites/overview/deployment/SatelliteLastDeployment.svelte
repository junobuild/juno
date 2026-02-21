<script lang="ts">
	import type { Satellite } from '$lib/types/satellite';
	import type { Workflow, WorkflowKey } from '$lib/types/workflow';
	import SatelliteLastDeploymentLoader from '$lib/components/satellites/overview/deployment/SatelliteLastDeploymentLoader.svelte';
	import SatelliteLastDeploymentValue from '$lib/components/satellites/overview/deployment/SatelliteLastDeploymentValue.svelte';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();
</script>

<SatelliteLastDeploymentLoader {satellite}>
	{#snippet content([key, workflow]: [WorkflowKey, Workflow])}
		<SatelliteLastDeploymentValue {key} {workflow} />
	{/snippet}
</SatelliteLastDeploymentLoader>
