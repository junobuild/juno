<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Snippet } from 'svelte';
	import CanisterMonitoringChart from '$lib/components/canister/CanisterMonitoringChart.svelte';
	import CanisterMonitoringData from '$lib/components/canister/CanisterMonitoringData.svelte';
	import type { CanisterMonitoringData as CanisterMonitoringDataType } from '$lib/types/canister';

	interface Props {
		canisterId: Principal;
		children: Snippet;
	}

	let { children, canisterId }: Props = $props();

	let monitoringData = $state<CanisterMonitoringDataType | undefined>(undefined);

	let chartsData = $derived(monitoringData?.chartsData ?? []);
</script>

<CanisterMonitoringData {canisterId} bind:monitoringData>
	<div>
		<CanisterMonitoringChart {chartsData} />

		{@render children()}
	</div>
</CanisterMonitoringData>
