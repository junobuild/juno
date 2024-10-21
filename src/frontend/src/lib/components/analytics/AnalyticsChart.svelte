<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { eachDayOfInterval, startOfDay } from 'date-fns';
	import { fade } from 'svelte/transition';
	import Chart from '$lib/components/charts/Chart.svelte';
	import type { ChartsData } from '$lib/types/chart';
	import type {
		AnalyticsMetrics,
		AnalyticsPageViews,
		DateStartOfTheDay
	} from '$lib/types/ortbiter';
	import { last } from '$lib/utils/utils';

	export let data: AnalyticsPageViews;

	let metrics: AnalyticsMetrics;
	$: ({ metrics } = data);

	let daily_total_page_views: Record<DateStartOfTheDay, number>;
	$: ({ daily_total_page_views } = metrics);

	let dailyTotalArray: [string, number][];
	$: dailyTotalArray = Object.entries(daily_total_page_views);

	let chartsPageViews: ChartsData[];
	$: chartsPageViews = dailyTotalArray
		.map(([key, value]) => ({
			x: key,
			y: value
		}))
		.sort(({ x: aKey }, { x: bKey }) => parseInt(aKey) - parseInt(bKey));

	const populateChartsData = (chartsPageViews: ChartsData[]): ChartsData[] => {
		if (chartsPageViews.length < 1) {
			return chartsPageViews;
		}

		const firstPageView = chartsPageViews[0];
		const startDate = new Date(parseInt(firstPageView.x));

		const datePlusOneDay = () => {
			const nextDate = new Date(startDate);
			nextDate.setDate(nextDate.getDate() + 1);

			return [
				...chartsPageViews,
				{
					x: `${nextDate.getTime()}`,
					y: 0
				}
			];
		};

		if (chartsPageViews.length === 1) {
			return datePlusOneDay();
		}

		const lastPageView = last(chartsPageViews);

		if (isNullish(lastPageView)) {
			return datePlusOneDay();
		}

		const endDate = new Date(parseInt(lastPageView.x));

		const allDates = eachDayOfInterval({
			start: startDate,
			end: endDate
		});

		return allDates.map((date) => ({
			x: `${startOfDay(date).getTime()}`,
			y: daily_total_page_views[date.getTime()] ?? 0
		}));
	};

	let chartsData: ChartsData[];
	$: chartsData = populateChartsData(chartsPageViews);
</script>

{#if dailyTotalArray.length > 0}
	<div class="chart-container" in:fade>
		<Chart {chartsData} />
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/shadow';

	.chart-container {
		width: 100%;
		height: 300px;
		fill: var(--value-color);

		margin: 0 0 var(--padding-4x);
		padding: var(--padding-2x) var(--padding-6x);

		@include shadow.strong-card;
	}
</style>
