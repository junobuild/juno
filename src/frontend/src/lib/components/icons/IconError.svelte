<!-- source: https://fonts.google.com/icons?icon.query=error&selected=Material+Symbols+Outlined:error:FILL@0;wght@400;GRAD@0;opsz@24&icon.size=24&icon.color=%23000000 -->
<script lang="ts">
	interface Props {
		size?: string;
	}

	let { size = '24px' }: Props = $props();
</script>

<svg
	fill="var(--color-error)"
	height={size}
	viewBox="0 -960 960 960"
	width={size}
	xmlns="http://www.w3.org/2000/svg"
	><path
		d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
	/></svg
>

<style lang="scss">
	svg {
		vertical-align: text-bottom;
	}
</style>
