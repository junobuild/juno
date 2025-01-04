<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="checkbox-group">
	{@render children()}
</div>

<style lang="scss">
	.checkbox-group {
		display: flex;
		flex-direction: column;
		row-gap: var(--padding);
		padding: 0 0 var(--padding);
	}
</style>
