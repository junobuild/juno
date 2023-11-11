<script lang="ts">
	import { LayerCake, Svg } from 'layercake';
	import AxisX from '$lib/components/charts/AxisX.svelte';
	import AxisY from '$lib/components/charts/AxisY.svelte';
	import Line from '$lib/components/charts/Line.svelte';
	import Area from '$lib/components/charts/Area.svelte';
	import type { AnalyticKey, PageView } from '$declarations/orbiter/orbiter.did';
	import {
		formatToDay,
		fromBigIntNanoSeconds,
		getDatesInRange,
		startOfDay
	} from '$lib/utils/date.utils';
	import { last } from '$lib/utils/utils';
	import { isNullish } from '@dfinity/utils';

	export let data: [AnalyticKey, PageView][];

	let totalPageViews: Record<string, number>;
	$: totalPageViews = data.reduce(
		(acc, [{ collected_at }, _]) => {
			const date = fromBigIntNanoSeconds(collected_at);

			const key = startOfDay(date);

			return {
				...acc,
				[key]: (acc[key] ?? 0) + 1
			};
		},
		{} as Record<string, number>
	);

	const xKey = 'myX';
	const yKey = 'myY';

	type ChartsData = {
		[xKey]: string;
		[yKey]: number;
	};

	let chartsPageViews: ChartsData[];
	$: chartsPageViews = Object.entries(totalPageViews)
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

		const allDates = getDatesInRange({
			startDate,
			endDate
		});

		return allDates.map((date) => ({
			[xKey]: `${date.getTime()}`,
			[yKey]: totalPageViews[date.getTime()] ?? 0
		}));
	};

	let chartsData: ChartsData[];
	$: chartsData = populateChartsData(chartsPageViews);

	let ticks: string[];
	$: ticks = Object.values(chartsData).map(({ [xKey]: a }) => a);

	const formatTick = (d: string): string => {
		const date = new Date(parseInt(d));
		const time = date.getDate();
		return time % 2 != 0 ? formatToDay(date) : '';
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
