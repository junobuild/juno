<!--
  @component
  Generates an SVG area shape using the `area` function from [d3-shape](https://github.com/d3/d3-shape).
 -->
<script lang="ts">
	import { getContext } from 'svelte';

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { data, xGet, yGet } = getContext('LayerCake');

	interface Props {
		stroke?: string;
	}

	let { stroke = 'var(--color-primary)' }: Props = $props();

	let path = $derived(`M${$data.map((d: number) => `${$xGet(d)},${$yGet(d)}`).join('L')}`);
</script>

<path class="path-line" d={path} {stroke} />

<style lang="scss">
	.path-line {
		fill: none;
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 2;
	}
</style>
