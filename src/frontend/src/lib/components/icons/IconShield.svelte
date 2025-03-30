<!-- source: https://fonts.google.com/icons?selected=Material+Symbols+Outlined:shield:FILL@0;wght@400;GRAD@0;opsz@24&icon.size=24&icon.color=%23000000&icon.query=shield&icon.set=Material+Symbols&icon.style=Outlined -->
<script lang="ts">
	interface Props {
		size?: string;
	}

	let { size = '24px' }: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	height={size}
	width={size}
	viewBox="0 0 24 24"
	fill="currentColor"
	><g><rect fill="none" height="24" width="24" /></g><g
		><g
			><path
				d="M6,6.39v4.7c0,4,2.55,7.7,6,8.83c3.45-1.13,6-4.82,6-8.83v-4.7l-6-2.25L6,6.39 z"
				style="fill: var(--color-background);"
			/><path
				d="M12,2L4,5v6.09c0,5.05,3.41,9.76,8,10.91c4.59-1.15,8-5.86,8-10.91V5L12,2z M18,11.09c0,4-2.55,7.7-6,8.83 c-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25l6,2.25V11.09z"
			/></g
		></g
	></svg
>
