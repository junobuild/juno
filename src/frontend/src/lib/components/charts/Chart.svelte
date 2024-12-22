<script lang="ts">
	import { LayerCake, Svg } from 'layercake';
	import Area from '$lib/components/charts/Area.svelte';
	import AxisX from '$lib/components/charts/AxisX.svelte';
	import AxisY from '$lib/components/charts/AxisY.svelte';
	import Line from '$lib/components/charts/Line.svelte';
	import type { ChartsData } from '$lib/types/chart';
	import { formatToDay } from '$lib/utils/date.utils';

	interface Props {
		chartsData: ChartsData[];
		axis?: boolean;
		padding?: {
			top?: number;
			right?: number;
			bottom?: number;
			left?: number;
		} | undefined;
	}

	let { chartsData, axis = true, padding }: Props = $props();

	let ticks: string[] = $derived(Object.values(chartsData).map(({ x: a }) => a));

	const formatTick = (d: string | number): string | number => {
		const date = new Date(parseInt(`${d}`));
		const day = date.getDate();

		return day % 3 === 0 ? formatToDay(date) : '';
	};
</script>

<LayerCake
	padding={padding ?? { top: 32, right: 16, bottom: 32, left: 16 }}
	x={'x'}
	y={'y'}
	yNice={4}
	yDomain={[0, null]}
	data={chartsData}
>
	<Svg>
		{#if axis}
			<AxisX {formatTick} {ticks} />
			<AxisY ticks={4} />
			{/if}
		<Line />
		<Area />
	</Svg>
</LayerCake>
