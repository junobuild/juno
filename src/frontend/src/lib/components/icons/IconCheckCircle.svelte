<!-- source: https://fonts.google.com/icons?selected=Material+Symbols+Outlined:check_circle:FILL@0;wght@200;GRAD@0;opsz@24&icon.size=24&icon.color=%23000000&icon.query=check&icon.set=Material+Symbols -->
<script lang="ts">
	interface Props {
		size?: string;
	}

	let { size = '24px' }: Props = $props();
</script>

<svg
	fill="currentColor"
	height={size}
	viewBox="0 -960 960 960"
	width={size}
	xmlns="http://www.w3.org/2000/svg"
	><path
		d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
	/></svg
>

<style lang="scss">
	svg {
		vertical-align: var(--icon-text-align, text-bottom);
	}
</style>
