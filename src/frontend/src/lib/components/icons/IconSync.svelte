<!-- https://fonts.google.com/icons?selected=Material%20Icons%20Sharp%3Async%3A -->
<!-- Tweaked and animated -->
<script lang="ts">
	interface Props {
		size?: string;
	}

	let { size = '20px' }: Props = $props();
</script>

<svg
	fill="currentColor"
	height={size}
	viewBox="0 0 24 24"
	width={size}
	xmlns="http://www.w3.org/2000/svg"
>
	<rect style="fill:none;fill-rule:nonzero;" height="24" width="24" x="0.01" y="0" />
	<g transform="matrix(1,0,0,-1,0,24)">
		<path
			style="fill-rule:nonzero;"
			d="M12,4L12,1L8,5L12,9L12,6C15.31,6 18,8.69 18,12C18,13.01 17.75,13.97 17.3,14.8L18.76,16.26C19.54,15.03 20,13.57 20,12C20,7.58 16.42,4 12,4ZM12,18C8.69,18 6,15.31 6,12C6,10.99 6.25,10.03 6.7,9.2L5.24,7.74C4.46,8.97 4,10.43 4,12C4,16.42 7.58,20 12,20L12,23L16,19L12,15L12,18Z"
		/>
	</g>
</svg>

<style lang="scss">
	svg {
		animation: rotate 4s linear infinite;
	}

	/* -global- */
	@keyframes -global-rotate {
		100% {
			transform: rotate(360deg);
		}
	}
</style>
