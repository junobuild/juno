<!-- source: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:check:FILL@0;wght@200;GRAD@0;opsz@24&icon.size=24&icon.color=%23000000&icon.query=check&icon.set=Material+Symbols&icon.style=Rounded -->
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
		d="m382-354 339-339q12-12 28-12t28 12q12 12 12 28.5T777-636L410-268q-12 12-28 12t-28-12L182-440q-12-12-11.5-28.5T183-497q12-12 28.5-12t28.5 12l142 143Z"
	/></svg
>

<style lang="scss">
	svg {
		vertical-align: var(--icon-text-align, text-bottom);
	}
</style>
