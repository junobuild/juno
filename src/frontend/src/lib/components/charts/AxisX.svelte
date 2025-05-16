<!--
  @component
  Generates an SVG x-axis. This component is also configured to detect if your x-scale is an ordinal scale. If so, it will place the markers in the middle of the bandwidth.
 -->
<script lang="ts">
	import { getContext } from 'svelte';

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { width, height, xScale, yRange } = getContext('LayerCake');

	interface Props {
		gridlines?: boolean;
		tickMarks?: boolean;
		baseline?: boolean;
		snapTicks?: boolean;
		formatTick?: (d: string | number) => string | number;
		/** @type {Number|Array|Function} [ticks] - If this is a number, it passes that along to the [d3Scale.ticks](https://github.com/d3/d3-scale) function. If this is an array, hardcodes the ticks to those values. If it's a function, passes along the default tick values and expects an array of tick values in return. If nothing, it uses the default ticks supplied by the D3 function. */
		ticks?: string | ((ticks: string) => void) | undefined | string[] | number[];
		xTick?: number;
		yTick?: number;
		axisWithText?: boolean;
	}

	let {
		gridlines = true,
		tickMarks = false,
		baseline = false,
		snapTicks = false,
		formatTick = (d: string | number): string | number => d,
		ticks = undefined,
		xTick = 0,
		yTick = 16,
		axisWithText = true
	}: Props = $props();

	let isBandwidth = $derived(typeof $xScale.bandwidth === 'function');

	let tickVals = $derived(
		Array.isArray(ticks)
			? ticks
			: isBandwidth
				? $xScale.domain()
				: typeof ticks === 'function'
					? ticks($xScale.ticks())
					: $xScale.ticks(ticks)
	);

	const textAnchor = (i: number): 'start' | 'end' | 'middle' => {
		if (snapTicks === true) {
			if (i === 0) {
				return 'start';
			}
			if (i === tickVals.length - 1) {
				return 'end';
			}
		}
		return 'middle';
	};
</script>

<g class="axis x-axis" class:snapTicks>
	{#each tickVals as tick, i (tick)}
		<g class="tick tick-{i}" transform="translate({$xScale(tick)},{Math.max(...$yRange)})">
			{#if gridlines !== false}
				<line class="gridline" y1={$height * -1} y2="0" x1="0" x2="0" />
			{/if}
			{#if tickMarks === true}
				<line
					class="tick-mark"
					y1={0}
					y2={6}
					x1={isBandwidth ? $xScale.bandwidth() / 2 : 0}
					x2={isBandwidth ? $xScale.bandwidth() / 2 : 0}
				/>
			{/if}
			{#if axisWithText}
				<text
					x={isBandwidth ? $xScale.bandwidth() / 2 + xTick : xTick}
					y={yTick}
					dx=""
					dy=""
					text-anchor={textAnchor(i)}>{formatTick(tick)}</text
				>
			{/if}
		</g>
	{/each}
	{#if baseline === true}
		<line class="baseline" y1={$height + 0.5} y2={$height + 0.5} x1="0" x2={$width} />
	{/if}
</g>

<style lang="scss">
	.tick {
		font-size: var(--font-size-ultra-small);
	}

	line,
	.tick line {
		stroke: var(--label-color);
		stroke-dasharray: 2;
	}

	.tick text {
		fill: var(--text-color);
	}

	.tick .tick-mark,
	.baseline {
		stroke-dasharray: 0;
	}
	/* This looks slightly better */
	.axis.snapTicks .tick:last-child text {
		transform: translateX(3px);
	}
	.axis.snapTicks .tick.tick-0 text {
		transform: translateX(-3px);
	}
</style>
