<!--
  @component
  Generates an SVG scatter plot. This component can also work if the x- or y-scale is ordinal, i.e. it has a `.bandwidth` method. See the [timeplot chart](https://layercake.graphics/example/Timeplot) for an example.
 -->
<script lang="ts">
	import { getContext } from 'svelte';

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { data, xGet, yGet, xScale, yScale } = getContext('LayerCake');

	interface Props {
		/** The circle's radius. */
		r?: number;
		/** The circle's fill color. */
		fill?: string;
		/** The circle's stroke color. */
		stroke?: string;
		/** The circle's stroke width. */
		strokeWidth?: number;
	}

	let { r = 5, fill = '#0cf', stroke = '#000', strokeWidth = 0 }: Props = $props();
</script>

<g class="scatter-group">
	<!-- eslint-disable-next-line svelte/require-each-key -->
	{#each $data as d}
		<circle
			cx={$xGet(d) + ($xScale.bandwidth ? $xScale.bandwidth() / 2 : 0)}
			cy={$yGet(d) + ($yScale.bandwidth ? $yScale.bandwidth() / 2 : 0)}
			{r}
			{fill}
			{stroke}
			stroke-width={strokeWidth}
		/>
	{/each}
</g>
