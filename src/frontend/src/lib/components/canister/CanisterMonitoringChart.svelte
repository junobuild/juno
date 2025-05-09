<script lang="ts">
	import { fade } from 'svelte/transition';
	import Chart from '$lib/components/charts/Chart.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ChartsData } from '$lib/types/chart';

	interface Props {
		chartsData: ChartsData[];
	}

	let { chartsData }: Props = $props();
</script>

{#if chartsData.length > 0}
	<div in:fade>
		<Value>
			{#snippet label()}
				{$i18n.core.usage} <small>(T Cycles)</small>
			{/snippet}

			<div class="chart-container">
				<Chart {chartsData} tickSpacingInDays={chartsData.length > 13 ? 7 : 3} />
			</div>
		</Value>
	</div>
{/if}

<style lang="scss">
	.chart-container {
		width: 100%;
		height: 258px;
		fill: var(--value-color);

		margin: var(--padding-0_5x) 0 var(--padding-4x);
		padding: 0 0 var(--padding-2x);
	}
</style>
