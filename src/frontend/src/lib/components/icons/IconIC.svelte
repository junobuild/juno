<script lang="ts">
	interface Props {
		title?: string | undefined;
	}

	let { title = undefined }: Props = $props();
</script>

<svg
	width="24px"
	height="24px"
	viewBox="0 0 364 172"
	xmlns="http://www.w3.org/2000/svg"
	xml:space="preserve"
>
	{#if title !== undefined}
		<title>{title}</title>
	{/if}
	<path
		d="M275.381,0c-20.334,0 -42.497,10.419 -65.925,30.942c-11.114,9.724 -20.712,20.143 -27.911,28.479l0.064,0.063l-0,-0.063c-0,-0 11.366,12.376 23.932,25.637c6.756,-8.02 16.481,-18.944 27.659,-28.795c20.838,-18.249 34.413,-22.101 42.181,-22.101c29.238,0 52.978,23.175 52.978,51.654c0,28.289 -23.806,51.465 -52.978,51.653c-1.328,-0 -3.031,-0.188 -5.178,-0.632c8.525,3.663 17.681,6.316 26.394,6.316c53.55,0 64.031,-34.92 64.725,-37.446c1.578,-6.378 2.4,-13.071 2.4,-19.954c-0,-47.234 -39.656,-85.753 -88.341,-85.753Z"
		style="fill:url(#_Linear1);fill-rule:nonzero;"
	/><path
		d="M88.342,171.759c20.333,0 42.497,-10.422 65.924,-30.943c11.114,-9.725 20.712,-20.144 27.911,-28.479l-0.064,-0.063l0,0.063c0,0 -11.366,-12.376 -23.932,-25.637c-6.757,8.02 -16.481,18.944 -27.658,28.795c-20.838,18.249 -34.415,22.102 -42.181,22.102c-29.237,-0.066 -52.98,-23.239 -52.98,-51.718c-0,-28.289 23.806,-51.464 52.98,-51.653c1.325,-0 3.03,0.189 5.177,0.631c-8.524,-3.663 -17.681,-6.315 -26.395,-6.315c-53.547,0 -63.967,34.92 -64.724,37.383c-1.579,6.441 -2.4,13.071 -2.4,19.954c-0,47.358 39.656,85.88 88.342,85.88Z"
		style="fill:url(#_Linear2);fill-rule:nonzero;"
	/><path
		d="M296.472,142.394c-27.406,-0.694 -55.885,-22.291 -61.694,-27.657c-15.028,-13.893 -49.696,-51.464 -52.412,-54.432c-25.384,-28.479 -59.799,-60.305 -94.024,-60.305l-0.127,-0c-41.55,0.189 -76.47,28.352 -85.815,65.925c0.694,-2.463 14.397,-38.078 64.661,-36.815c27.406,0.695 56.011,22.607 61.884,27.974c15.028,13.892 49.696,51.464 52.411,54.432c25.385,28.415 59.8,60.24 94.025,60.24l0.125,0c41.55,-0.187 76.535,-28.35 85.816,-65.923c-0.756,2.463 -14.522,37.761 -64.85,36.561Z"
		style="fill:#29abe2;fill-rule:nonzero;"
	/><defs
		><linearGradient
			id="_Linear1"
			x1="0"
			y1="0"
			x2="1"
			y2="0"
			gradientUnits="userSpaceOnUse"
			gradientTransform="matrix(120.113,124.378,-124.378,120.113,229.394,11.325)"
			><stop offset="0" style="stop-color:#f15a24;stop-opacity:1" /><stop
				offset="0.21"
				style="stop-color:#f15a24;stop-opacity:1"
			/><stop offset="0.68" style="stop-color:#fbb03b;stop-opacity:1" /><stop
				offset="1"
				style="stop-color:#fbb03b;stop-opacity:1"
			/></linearGradient
		><linearGradient
			id="_Linear2"
			x1="0"
			y1="0"
			x2="1"
			y2="0"
			gradientUnits="userSpaceOnUse"
			gradientTransform="matrix(-120.111,-124.38,124.38,-120.111,134.328,160.434)"
			><stop offset="0" style="stop-color:#ed1e79;stop-opacity:1" /><stop
				offset="0.21"
				style="stop-color:#ed1e79;stop-opacity:1"
			/><stop offset="0.89" style="stop-color:#522785;stop-opacity:1" /><stop
				offset="1"
				style="stop-color:#522785;stop-opacity:1"
			/></linearGradient
		></defs
	></svg
>

<style lang="scss">
	svg {
		display: block;
	}
</style>
