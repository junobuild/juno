<!--
  @component
  Generates an SVG area shape using the `area` function from [d3-shape](https://github.com/d3/d3-shape).
 -->
<script lang="ts">
	import { getContext } from 'svelte';

	const { data, xGet, yGet, xScale, yScale, extents } = getContext('LayerCake');

	interface Props {
		fill?: string;
	}

	let { fill = 'rgba(var(--color-primary-rgb), 0.1)' }: Props = $props();

	let path = $derived(`M${$data.map((d: number) => `${$xGet(d)},${$yGet(d)}`).join('L')}`);

	let yRange = $derived(yScale.range());

	let area = $derived(
		`${path}L${$xScale($extents.x ? $extents.x[1] : 0)},${yRange[0]}L${$xScale(
			$extents.x ? $extents.x[0] : 0
		)},${yRange[0]}Z`
	);
</script>

<path class="path-area" d={area} {fill} />
