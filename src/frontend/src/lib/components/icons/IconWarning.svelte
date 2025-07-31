<!-- source: https://fonts.google.com/icons?selected=Material%20Symbols%20Rounded%3Awarning%3AFILL%401%3Bwght%40400%3BGRAD%400%3Bopsz%4024 -->
<script lang="ts">
	interface Props {
		size?: string;
	}

	let { size = '32px' }: Props = $props();
</script>

<svg
	fill="currentColor"
	height={size}
	viewBox="0 -960 960 960"
	width={size}
	xmlns="http://www.w3.org/2000/svg"
	><path
		d="M109-120q-11 0-20-5.5T75-140q-5-9-5.5-19.5T75-180l370-640q6-10 15.5-15t19.5-5q10 0 19.5 5t15.5 15l370 640q6 10 5.5 20.5T885-140q-5 9-14 14.5t-20 5.5H109Zm371-120q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm0-120q17 0 28.5-11.5T520-400v-120q0-17-11.5-28.5T480-560q-17 0-28.5 11.5T440-520v120q0 17 11.5 28.5T480-360Z"
	/></svg
>

<style lang="scss">
	svg {
		vertical-align: middle;
	}

	path {
		stroke: var(--text-color);
		stroke-width: 8px;
	}
</style>
