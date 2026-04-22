<!--
  @component
  Generates an SVG radar chart.
 -->
<script lang="ts">
	import { line, curveCardinalClosed } from 'd3-shape';
	import { getContext } from 'svelte';

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { data, width, height, xGet, config } = getContext('LayerCake');

	interface Props {
		/**  @type {String} [fill='var(--color-primary)'] - The radar's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color. */
		fill?: string;

		/**  @type {String} [stroke='var(--color-primary)'] - The radar's stroke color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color. */
		stroke?: string;

		/**  @type {Number} [strokeWidth=2] - The radar's stroke color. */
		strokeWidth?: number;

		/**  @type {Number} [fillOpacity=0.25] - The radar's fill opacity. */
		fillOpacity?: number;

		/**  @type {Number} [r=3.5] - Each circle's radius. */
		r?: number;

		/**  @type {String} [circleFill="var(--color-primary)"] - Each circle's fill color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color. */
		circleFill?: string;

		/**  @type {String} [circleStroke="var(--color-primary-contrast)"] - Each circle's stroke color. This is technically optional because it comes with a default value but you'll likely want to replace it with your own color. */
		circleStroke?: string;

		/**  @type {Number} [circleStrokeWidth=0] - Each circle's stroke width. */
		circleStrokeWidth?: number;
	}

	let {
		fill = 'var(--color-primary)',
		stroke = 'var(--color-primary)',
		strokeWidth = 2,
		fillOpacity = 0.25,
		r = 3.5,
		circleFill = 'var(--color-primary)',
		circleStroke = 'var(--color-primary-contrast)',
		circleStrokeWidth = 0
	}: Props = $props();

	let angleSlice = $derived((Math.PI * 2) / $config.x.length);

	let path = $derived(
		line()
			.curve(curveCardinalClosed)
			// eslint-disable-next-line local-rules/prefer-object-params
			.x((d, i) => (d as unknown as number) * Math.cos(angleSlice * i - Math.PI / 2))
			// eslint-disable-next-line local-rules/prefer-object-params
			.y((d, i) => (d as unknown as number) * Math.sin(angleSlice * i - Math.PI / 2))
	);
</script>

<g transform="translate({$width / 2}, {$height / 2})">
	{#each $data as row, index (index)}
		{@const xVals = $xGet(row)}
		<!-- Draw a line connecting all the dots -->
		<path
			class="path-line"
			d={path(xVals)}
			{fill}
			fill-opacity={fillOpacity}
			{stroke}
			stroke-width={strokeWidth}
		></path>

		<!-- Plot each dots -->
		{#each xVals as circleR, i (i)}
			{@const thisAngleSlice = angleSlice * i - Math.PI / 2}
			<circle
				cx={circleR * Math.cos(thisAngleSlice)}
				cy={circleR * Math.sin(thisAngleSlice)}
				fill={circleFill}
				{r}
				stroke={circleStroke}
				stroke-width={circleStrokeWidth}
			></circle>
		{/each}
	{/each}
</g>

<style lang="scss">
	.path-line {
		stroke-linejoin: round;
		stroke-linecap: round;
	}
</style>
