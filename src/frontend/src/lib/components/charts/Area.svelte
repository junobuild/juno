<!--
  @component
  Generates an SVG area shape using the `area` function from [d3-shape](https://github.com/d3/d3-shape).
 -->
<script lang="ts">
	import { run } from 'svelte/legacy';

	import { getContext } from 'svelte';

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { data, xGet, yGet, xScale, yScale, extents } = getContext('LayerCake');

	interface Props {
		fill?: String;
	}

	let { fill = 'rgba(var(--color-primary-rgb), 0.1)' }: Props = $props();

	let path = $derived(`M${$data.map((d: number) => `${$xGet(d)},${$yGet(d)}`).join('L')}`);

	let area: string = $state();

	run(() => {
		const yRange = $yScale.range();
		area = `${path}L${$xScale($extents.x ? $extents.x[1] : 0)},${yRange[0]}L${$xScale(
			$extents.x ? $extents.x[0] : 0
		)},${yRange[0]}Z`;
	});
</script>

<path class="path-area" d={area} {fill} />
