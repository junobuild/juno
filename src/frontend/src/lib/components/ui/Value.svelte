<script lang="ts">
	interface Props {
		ref?: undefined | string;
		label?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	}

	let { ref = undefined, label, children }: Props = $props();
</script>

<label for={ref}>{@render label?.()}:</label>
<div>{@render children?.()}</div>

<style lang="scss">
	label {
		font-weight: var(--font-weight-bold);
	}

	div {
		color: var(--value-color);
	}
</style>
