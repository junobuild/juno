<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { fade } from 'svelte/transition';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ChartsData } from '$lib/types/chart';
	import Chart from '$lib/components/charts/Chart.svelte';
	import CanisterJunoStatuses from '$lib/components/canister/CanisterJunoStatuses.svelte';

	export let satellite: Satellite;

	let chartsData: ChartsData[] = [];

	const onStatuses = ({ detail }: CustomEvent<ChartsData[]>) => {
		chartsData = detail;
	};
</script>

<CanisterJunoStatuses
	segment="satellite"
	canisterId={satellite.satellite_id}
	on:junoStatuses={onStatuses}
>
	{#if chartsData.length > 0}
		<div class="container" in:fade>
			<Value>
				<svelte:fragment slot="label"
					>{$i18n.observatory.title} <small>(T Cycles)</small></svelte:fragment
				>

				<div class="chart-container">
					<Chart {chartsData} />
				</div>
			</Value>
		</div>
	{/if}
</CanisterJunoStatuses>

<style lang="scss">
	@use '../../styles/mixins/shadow';

	.container {
		grid-column: 2 / 4;
	}

	.chart-container {
		width: 100%;
		height: 258px;
		fill: var(--value-color);

		margin: 0 0 var(--padding-4x);
	}
</style>
