<!--
  @component
  Generates an SVG radial scale, useful for radar charts.
 -->
<script lang="ts">
	import { getContext } from 'svelte';

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { width, height, xScale, extents, config } = getContext('LayerCake');

	interface Props {
		/** @type {Number} [lineLengthFactor=1.1] - How far to extend the lines from the circle's center. A value of `1` puts them at the circle's circumference. */
		lineLengthFactor?: number;

		/** @type {Number} [labelPlacementFactor=1.25] - How far to place the labels from the circle's center. A value of `1` puts them at the circle's circumference. */
		labelPlacementFactor?: number;
	}

	let { lineLengthFactor = 1.1, labelPlacementFactor = 1.25 }: Props = $props();

	let max = $derived($xScale(Math.max(...$extents.x)));

	let lineLength = $derived(max * lineLengthFactor);
	let labelPlacement = $derived(max * labelPlacementFactor);

	let angleSlice = $derived((Math.PI * 2) / $config.x.length);

	/** @param {Number} total
	 *  @param {Number} i */
	// eslint-disable-next-line local-rules/prefer-object-params
	const anchor = (total: number, i: number): string => {
		if (i === 0 || i === total / 2) {
			return 'middle';
		}
		if (i < total / 2) {
			return 'start';
		}
		return 'end';
	};
</script>

<g transform="translate({$width / 2}, {$height / 2})">
	<circle cx="0" cy="0" r={max} class="line bg" stroke-width="1" fill-opacity="0.1"></circle>
	<circle cx="0" cy="0" r={max / 2} stroke-width="1" fill="none" class="line"></circle>

	{#each $config.x as label, i (i)}
		{@const thisAngleSlice = angleSlice * i - Math.PI / 2}
		<line
			class="line"
			x1="0"
			y1="0"
			x2={lineLength * Math.cos(thisAngleSlice)}
			y2={lineLength * Math.sin(thisAngleSlice)}
			stroke-width="1"
			fill="none"
		>
		</line>
		<text
			text-anchor={anchor($config.x.length, i)}
			dy="0.35em"
			font-size="var(--font-size-ultra-small)"
			transform="translate({labelPlacement * Math.cos(thisAngleSlice)}, {labelPlacement *
				Math.sin(thisAngleSlice)})">{label}</text
		>
	{/each}
</g>

<style lang="scss">
	text {
		fill: var(--value-color);
	}

	.line {
		stroke: var(--label-color);
	}

	.bg {
		fill: var(--label-color);
	}
</style>
