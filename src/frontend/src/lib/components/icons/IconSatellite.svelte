<!-- CC BY-NC-SA - Didier Renaud - https://www.customfuture.com/ -->
<script lang="ts">
	interface Props {
		size?: string;
	}

	let { size = '40px' }: Props = $props();
</script>

<svg height={size} viewBox="0 0 29 29" width={size} xmlns="http://www.w3.org/2000/svg"
	><g
		><g
			><rect class="icon-satellite-1" height="29" width="29" /><circle
				class="icon-satellite-2"
				cx="19.86"
				cy="9.14"
				r="7.85"
			/><path
				class="icon-satellite-3"
				d="m26.12,2.88C23.35.11,19.19-.43,15.87,1.25c-.02,0-.04,0-.06.01L.87,8.23c-.5.23-.72.83-.48,1.33.17.36.53.58.91.58.14,0,.29-.03.42-.09l10.19-4.75c-.57,1.19-.89,2.49-.89,3.84,0,2.04.69,3.98,1.96,5.54l-6.98,6.51c-.4.38-.43,1.01-.05,1.41.2.21.46.32.73.32.24,0,.49-.09.68-.27l7.04-6.57c1.55,1.23,3.46,1.9,5.47,1.9,1.35,0,2.65-.31,3.84-.88l-4.75,10.18c-.23.5-.02,1.1.48,1.33.14.06.28.09.42.09.38,0,.74-.21.91-.58l6.97-14.94s0-.02,0-.02c1.69-3.32,1.16-7.5-1.62-10.28Zm-10.24,11.82l3.53-3.29c.4-.38.43-1.01.05-1.41-.38-.41-1.01-.43-1.41-.05l-3.61,3.36c-.92-1.19-1.43-2.64-1.43-4.17,0-1.83.71-3.55,2.01-4.84,1.33-1.33,3.09-2,4.84-2s3.51.67,4.84,2c2.67,2.67,2.67,7.01,0,9.68-1.29,1.29-3.01,2.01-4.84,2.01-1.45,0-2.83-.45-3.98-1.28Z"
			/></g
		></g
	></svg
>

<style lang="scss">
	.icon-satellite-1 {
		fill: none;
		opacity: 0.25;
	}

	.icon-satellite-2 {
		fill: var(--color-background);
	}

	.icon-satellite-3 {
		fill: var(--color-background-contrast);
	}
</style>
