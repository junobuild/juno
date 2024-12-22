<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import CanisterMonitoringChart from '$lib/components/canister/CanisterMonitoringChart.svelte';
	import CanisterMonitoringLoader from '$lib/components/loaders/CanisterMonitoringLoader.svelte';
	import type { Segment } from '$lib/types/canister';
	import type { ChartsData } from '$lib/types/chart';

	interface Props {
		canisterId: Principal;
		segment: Segment;
	}

	let props: Props = $props();

	let chartsData: ChartsData[] = $state([]);
</script>

<CanisterMonitoringLoader {...props} bind:chartsData>
	<CanisterMonitoringChart {chartsData} />
</CanisterMonitoringLoader>
