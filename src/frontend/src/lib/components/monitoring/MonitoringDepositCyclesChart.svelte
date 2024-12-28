<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { CanisterMonitoringCharts } from '$lib/types/canister';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import TimeOfDayPlot from '$lib/components/charts/TimeOfDayPlot.svelte';
	import { addDays, eachDayOfInterval, format } from 'date-fns';

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
				<TimeOfDayPlot chartsData={depositedCycles} {allDays} />
			</div>
		</Value>
	</div>
{/if}

<style lang="scss">
	.chart-container {
		width: 100%;
		height: 258px;

		margin: 0 0 var(--padding-4x);
	}
</style>
