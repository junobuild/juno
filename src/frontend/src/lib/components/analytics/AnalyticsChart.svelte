<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { eachDayOfInterval, startOfDay } from 'date-fns';
	import { fade } from 'svelte/transition';
	import Chart from '$lib/components/charts/Chart.svelte';
	import type { ChartsData } from '$lib/types/chart';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';
	import { last } from '$lib/utils/utils';

	interface Props {
		data: AnalyticsPageViews;
	}

	let { data }: Props = $props();

	let { metrics } = $derived(data);

	let { daily_total_page_views } = $derived(metrics);

	let dailyTotalArray: [string, number][] = $derived(Object.entries(daily_total_page_views));

	let chartsPageViews: ChartsData[] = $derived(
		dailyTotalArray
			.map(([key, value]) => ({
				x: key,
				y: value
			}))
			.sort(({ x: aKey }, { x: bKey }) => parseInt(aKey) - parseInt(bKey))
	);

	const populateChartsData = (chartsPageViews: ChartsData[]): ChartsData[] => {
		if (chartsPageViews.length < 1) {
			return chartsPageViews;
		}

		const [firstPageView] = chartsPageViews;
		const startDate = new Date(parseInt(firstPageView.x));

		const datePlusOneDay = () => {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
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

	let chartsData: ChartsData[] = $derived(populateChartsData(chartsPageViews));
</script>

{#if dailyTotalArray.length > 0}
	<div class="chart-container" in:fade>
		<Chart {chartsData} />
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/shadow';
	@use '../../styles/mixins/media';

	.chart-container {
		width: 100%;
		height: 300px;
		fill: var(--value-color);

		margin: 0 0 var(--padding-6x);
		padding: 0 var(--padding-2x);

		@include media.min-width(medium) {
			padding: 0 var(--padding-8x);
		}

		@include media.min-width(large) {
			margin: 0 0 var(--padding-4x);
		}
	}
</style>
