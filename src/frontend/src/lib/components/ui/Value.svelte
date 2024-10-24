<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		ref?: undefined | string;
		label: Snippet;
		children: Snippet;
	}

	let { ref = undefined, label, children }: Props = $props();
</script>

<label for={ref}>{@render label()}:</label>
<div>{@render children()}</div>

<style lang="scss">
	label {
		font-weight: var(--font-weight-bold);
	}

	div {
		color: var(--value-color);
	}
</style>
