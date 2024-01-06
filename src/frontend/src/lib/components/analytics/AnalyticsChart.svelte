<script lang="ts">
	import { LayerCake, Svg } from 'layercake';
	import AxisX from '$lib/components/charts/AxisX.svelte';
	import AxisY from '$lib/components/charts/AxisY.svelte';
	import Line from '$lib/components/charts/Line.svelte';
	import Area from '$lib/components/charts/Area.svelte';
	import { formatToDay } from '$lib/utils/date.utils';
	import { last } from '$lib/utils/utils';
	import { isNullish } from '@dfinity/utils';
	import { eachDayOfInterval, startOfDay } from 'date-fns';
	import type {
		AnalyticsMetrics,
		AnalyticsPageViews,
		DateStartOfTheDay
	} from '$lib/types/ortbiter';

	export let data: AnalyticsPageViews;

	let metrics: AnalyticsMetrics;
	$: ({ metrics } = data);

	let daily_total_page_views: Record<DateStartOfTheDay, number>;
	$: ({ daily_total_page_views } = metrics);

	const xKey = 'myX';
	const yKey = 'myY';

	type ChartsData = {
		[xKey]: string;
		[yKey]: number;
	};

	let chartsPageViews: ChartsData[];
	$: chartsPageViews = Object.entries(daily_total_page_views)
		.map(([key, value]) => ({
			[xKey]: key,
			[yKey]: value
		}))
		.sort(({ [xKey]: aKey }, { [xKey]: bKey }) => parseInt(aKey) - parseInt(bKey));

	const populateChartsData = (chartsPageViews: ChartsData[]): ChartsData[] => {
		if (chartsPageViews.length < 1) {
			return chartsPageViews;
		}

		const firstPageView = chartsPageViews[0];
		const startDate = new Date(parseInt(firstPageView[xKey]));

		const datePlusOneDay = () => {
			const nextDate = new Date(startDate);
			nextDate.setDate(nextDate.getDate() + 1);

			return [
				...chartsPageViews,
				{
					[xKey]: `${nextDate.getTime()}`,
					[yKey]: 0
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

		const endDate = new Date(parseInt(lastPageView[xKey]));

		const allDates = eachDayOfInterval({
			start: startDate,
			end: endDate
		});

		return allDates.map((date) => ({
			[xKey]: `${startOfDay(date).getTime()}`,
			[yKey]: daily_total_page_views[date.getTime()] ?? 0
		}));
	};

	let chartsData: ChartsData[];
	$: chartsData = populateChartsData(chartsPageViews);

	let ticks: string[];
	$: ticks = Object.values(chartsData).map(({ [xKey]: a }) => a);

	const formatTick = (d: string): string => {
		const date = new Date(parseInt(d));
		const time = date.getDate();

		return chartsPageViews.length <= 31 && time % 2 != 0
			? formatToDay(date)
			: time % 5 === 0
				? formatToDay(date)
				: '';
	};
</script>

<div class="chart-container">
	<LayerCake
		padding={{ top: 32, right: 16, bottom: 32, left: 16 }}
		x={xKey}
		y={yKey}
		yNice={4}
		yDomain={[0, null]}
		data={chartsData}
	>
		<Svg>
			<AxisX {formatTick} {ticks} />
			<AxisY ticks={4} />
			<Line />
			<Area />
		</Svg>
	</LayerCake>
</div>

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
