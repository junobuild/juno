<!-- CC BY-NC-SA - Didier Renaud - https://www.customfuture.com/ -->
<script lang="ts">
	interface Props {
		size?: string;
	}

	let { size = '24px' }: Props = $props();
</script>

<svg height={size} viewBox="0 0 29 29" width={size} xmlns="http://www.w3.org/2000/svg"
	><g
		><g
			><rect class="icon-mission-control-1" height="29" width="29" /><rect
				class="icon-mission-control-2"
				height="24"
				rx="3"
				ry="3"
				width="24"
				x="2.5"
				y="2.5"
			/><path
				d="m23.5,27.5H5.5c-2.21,0-4-1.79-4-4V5.5C1.5,3.29,3.29,1.5,5.5,1.5h18c2.21,0,4,1.79,4,4v18c0,2.21-1.79,4-4,4ZM5.5,3.5c-1.1,0-2,.9-2,2v18c0,1.1.9,2,2,2h18c1.1,0,2-.9,2-2V5.5c0-1.1-.9-2-2-2H5.5Z"
			/><path
				d="m21.34,18.16H7.66c-1.25,0-2.26-1.01-2.26-2.26V7.37c0-1.25,1.01-2.26,2.26-2.26h13.68c1.25,0,2.26,1.01,2.26,2.26v8.53c0,1.25-1.01,2.26-2.26,2.26ZM7.66,7.11c-.14,0-.26.12-.26.26v8.53c0,.14.12.26.26.26h13.68c.14,0,.26-.12.26-.26V7.37c0-.14-.12-.26-.26-.26H7.66Z"
			/><circle cx="22.01" cy="22.13" r="1.49" /></g
		></g
	></svg
>

<style lang="scss">
	.icon-mission-control-1 {
		fill: none;
		opacity: 0.25;
	}

	.icon-mission-control-2 {
		fill: var(--color-background);
	}

	path,
	circle {
		fill: currentColor;
	}
</style>
