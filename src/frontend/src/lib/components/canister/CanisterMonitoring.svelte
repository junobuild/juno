<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import CanisterMonitoringChart from '$lib/components/canister/CanisterMonitoringChart.svelte';
	import CanisterMonitoringLoader from '$lib/components/loaders/CanisterMonitoringLoader.svelte';
	import type { CanisterMonitoringData, Segment } from '$lib/types/canister';
	import type { Snippet } from 'svelte';

	interface Props {
		canisterId: Principal;
		segment: Segment;
		children: Snippet;
	}

	let { children, ...props }: Props = $props();

	let monitoringData = $state<CanisterMonitoringData | undefined>(undefined);

	let chartsData = $derived(monitoringData?.chartsData ?? []);
</script>

<CanisterMonitoringLoader {...props} bind:data={monitoringData}>
	<div>
		<CanisterMonitoringChart {chartsData} />

		{@render children()}
	</div>
</CanisterMonitoringLoader>
