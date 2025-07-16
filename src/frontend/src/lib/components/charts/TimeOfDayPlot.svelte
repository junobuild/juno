<script lang="ts">
	import { scaleBand, scaleTime } from 'd3-scale';
	import { LayerCake, Svg } from 'layercake';
	import AxisX from '$lib/components/charts/AxisX.svelte';
	import AxisY from '$lib/components/charts/AxisY.svelte';
	import Scatter from '$lib/components/charts/Scatter.svelte';
	import type { TimeOfDayChartData } from '$lib/types/chart';

	interface Props {
		chartsData: TimeOfDayChartData[];
		allDays: string[];
		padding?:
			| {
					top?: number;
					right?: number;
					bottom?: number;
					left?: number;
			  }
			| undefined;
	}

	let { chartsData, allDays, padding }: Props = $props();

	const r = 4;
</script>

<LayerCake
	padding={padding ?? { top: 16, right: 16, bottom: 16, left: 70 }}
	x="x"
	y="y"
	xDomain={[0, 24 * 60 * 60]}
	yDomain={allDays}
	xScale={scaleTime()}
	yScale={scaleBand().paddingInner(0.05).round(true)}
	data={chartsData}
>
	<Svg>
		<AxisX
			ticks={[0, 4, 8, 12, 16, 20, 24].map((d) => d * 60 * 60)}
			formatTick={(d) => `${Math.floor(Number(d) / 60 / 60)}:00`}
		/>
		<AxisY />
		<Scatter {r} fill="var(--color-primary)" />
	</Svg>
</LayerCake>
