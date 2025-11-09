<!-- CC BY-NC-SA - Didier Renaud - https://www.customfuture.com/ -->
<script lang="ts">
	interface Props {
		size?: string;
	}

	let { size = '24px' }: Props = $props();
</script>

<svg
	fill="currentColor"
	height={size}
	viewBox="0 0 61.09 61.09"
	width={size}
	xmlns="http://www.w3.org/2000/svg"
	><g
		><path
			class="icon-new"
			d="m56.09,25.45h-20.45V5c0-2.76-2.24-5-5-5h-.18c-2.76,0-5,2.24-5,5v20.45H5c-2.76,0-5,2.24-5,5v.18c0,2.76,2.24,5,5,5h20.45v20.45c0,2.76,2.24,5,5,5h.18c2.76,0,5-2.24,5-5v-20.45h20.45c2.76,0,5-2.24,5-5v-.18c0-2.76-2.24-5-5-5Z"
		/></g
	></svg
>

<style lang="scss">
	.icon-new {
		fill: currentColor;
	}
</style>
