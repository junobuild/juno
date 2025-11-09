<!--
  @component
  Generates an SVG y-axis. This component is also configured to detect if your y-scale is an ordinal scale. If so, it will place the markers in the middle of the bandwidth.
 -->
<script lang="ts">
	import { getContext } from 'svelte';

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { padding, xRange, yScale, width } = getContext('LayerCake');

	interface Props {
		gridlines?: boolean;
		tickMarks?: boolean;
		formatTick?: (d: string | number) => string | number;
		/** @type {Number|Array<number>|Function} [ticks=4] - If this is a number, it passes that along to the [d3Scale.ticks](https://github.com/d3/d3-scale) function. If this is an array, hardcodes the ticks to those values. If it's a function, passes along the default tick values and expects an array of tick values in return. */
		ticks?: number | ((ticks: number) => number);
		xTick?: number;
		yTick?: number;
		dxTick?: number;
		dyTick?: number;
		textAnchor?: string;
		axisWithText?: boolean;
	}

	let {
		gridlines = true,
		tickMarks = false,
		formatTick = (d: number | string): string | number => d,
		ticks = 4,
		xTick = 0,
		yTick = 0,
		dxTick = 0,
		dyTick = -4,
		textAnchor = 'start',
		axisWithText = true
	}: Props = $props();

	let isBandwidth = $derived(typeof $yScale.bandwidth === 'function');

	let tickVals = $derived(
		Array.isArray(ticks)
			? ticks
			: isBandwidth
				? $yScale.domain()
				: typeof ticks === 'function'
					? ticks($yScale.ticks())
					: $yScale.ticks(ticks)
	);
</script>

<g class="axis y-axis" transform="translate({-$padding.left}, 0)">
	{#each tickVals as tick (tick)}
		<g
			class="tick tick-{tick}"
			transform="translate({$xRange[0] + (isBandwidth ? $padding.left : 0)}, {$yScale(tick)})"
		>
			{#if gridlines !== false}
				<line
					class="gridline"
					x2={$width}
					y1={isBandwidth ? $yScale.bandwidth() / 2 : 0}
					y2={isBandwidth ? $yScale.bandwidth() / 2 : 0}
				/>
			{/if}
			{#if tickMarks === true}
				<line
					class="tick-mark"
					x1="0"
					x2={isBandwidth ? -6 : 6}
					y1={isBandwidth ? $yScale.bandwidth() / 2 : 0}
					y2={isBandwidth ? $yScale.bandwidth() / 2 : 0}
				/>
			{/if}
			{#if axisWithText}
				<text
					style="text-anchor:{isBandwidth ? 'end' : textAnchor};"
					dx={isBandwidth ? -9 : dxTick}
					dy={isBandwidth ? 4 : dyTick}
					x={xTick}
					y={isBandwidth ? $yScale.bandwidth() / 2 + yTick : yTick}>{formatTick(tick)}</text
				>
			{/if}
		</g>
	{/each}
</g>

<style lang="scss">
	.tick {
		font-size: var(--font-size-ultra-small);
	}

	.tick line {
		stroke: var(--label-color);
	}
	.tick .gridline {
		stroke-dasharray: 2;
	}

	.tick text {
		fill: var(--text-color);
	}

	.tick.tick-0 line {
		stroke-dasharray: 0;
	}
</style>
