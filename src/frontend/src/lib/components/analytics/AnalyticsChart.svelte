<script lang="ts">
	import { LayerCake, Svg } from 'layercake';
	import AxisX from '$lib/components/charts/AxisX.svelte';
	import AxisY from '$lib/components/charts/AxisY.svelte';
	import Line from '$lib/components/charts/Line.svelte';
	import Area from '$lib/components/charts/Area.svelte';
	import type { AnalyticKey, PageView } from '$declarations/orbiter/orbiter.did';
	import { formatToDay, fromBigIntNanoSeconds } from '$lib/utils/date.utils';

	export let data: [AnalyticKey, PageView][];

	const xKey = 'myX';
	const yKey = 'myY';

	let totalPageViews: Record<string, number>;
	$: totalPageViews = data.reduce((acc, [_, { collected_at }]) => {
		const date = fromBigIntNanoSeconds(collected_at);

		// Start of the day
		const key = new Date(date.getTime() - (date.getTime() % 86400000)).getTime();

		return {
			...acc,
			[key]: (acc[key] ?? 0) + 1
		};
	}, {});

	let chartsData: {
		[xKey]: string;
		[yKey]: number;
	}[];
	$: chartsData = Object.entries(totalPageViews)
		.map(([key, value]) => ({
			[xKey]: key,
			[yKey]: value
		}))
		.sort(({ [xKey]: aKey }, { [xKey]: bKey }) => aKey - bKey);

	let ticks: number[];
	$: ticks = Object.values(chartsData).map(({ [xKey]: a }) => a);
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
			<AxisX formatTick={(d) => formatToDay(new Date(parseInt(d)))} {ticks} />
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
