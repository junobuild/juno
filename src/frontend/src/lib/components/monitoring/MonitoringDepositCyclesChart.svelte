<script lang="ts">
	import { addDays, eachDayOfInterval, format } from 'date-fns';
	import { fade } from 'svelte/transition';
	import TimeOfDayPlot from '$lib/components/charts/TimeOfDayPlot.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterMonitoringCharts } from '$lib/types/canister';

	let { depositedCycles }: Pick<CanisterMonitoringCharts, 'depositedCycles'> = $props();

	const allDays = eachDayOfInterval({
		start: addDays(new Date(), -6),
		end: new Date()
	}).map((d) => format(d, 'yyyy-MM-dd'));
</script>

{#if depositedCycles.length > 0}
	<div in:fade>
		<Value>
			{#snippet label()}
				{$i18n.monitoring.weekly_cycles_deposit}
			{/snippet}

			<div class="chart-container">
				<TimeOfDayPlot {allDays} chartsData={depositedCycles} />
			</div>
		</Value>
	</div>
{/if}

<style lang="scss">
	.chart-container {
		width: 100%;
		height: 258px;

		margin: var(--padding-0_5x) 0 var(--padding-4x);
		padding: 0 0 var(--padding-2x);
	}
</style>
