<!-- CC BY-NC-SA - Didier Renaud - https://www.customfuture.com/ -->
<script lang="ts">
	interface Props {
		size?: string;
	}

	let { size = '20px' }: Props = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 26" height={size} width={size}
	><g
		><g
			><line
				x1="1"
				y1="1"
				x2="24"
				y2="1"
				style="fill:none; stroke:currentColor; stroke-linecap:round; stroke-width:2px;"
			/><line
				x1="1"
				y1="9"
				x2="24"
				y2="9"
				style="fill:none; stroke:currentColor; stroke-linecap:round; stroke-width:2px;"
			/><line
				x1="1"
				y1="17"
				x2="24"
				y2="17"
				style="fill:none; stroke:currentColor; stroke-linecap:round; stroke-width:2px;"
			/><line
				x1="1"
				y1="25"
				x2="24"
				y2="25"
				style="fill:none; stroke:currentColor; stroke-linecap:round; stroke-width:2px;"
			/></g
		></g
	></svg
>
