<script lang="ts">
	import { LayerCake, Svg } from 'layercake';
	import AxisRadial from './AxisRadial.svelte';
	import Radar from './Radar.svelte';
	import { last } from '$lib/utils/utils';

	interface Props {
		chartsData: Record<string, number>;
	}

	let { chartsData }: Props = $props();

	let data = $derived([chartsData]);
	let xKey = $derived(Object.keys(chartsData));

	let maxXDomain = $derived(last(Object.values(chartsData).sort((a, b) => a - b)) as number);

	const xRange = ({ height }: { height: number }): [number, number] => [0, height / 2];
</script>

<LayerCake
	{data}
	padding={{ top: 30, right: 0, bottom: 7, left: 0 }}
	x={xKey}
	xDomain={[0, maxXDomain]}
	{xRange}
>
	<Svg>
		<AxisRadial />
		<Radar />
	</Svg>
</LayerCake>
