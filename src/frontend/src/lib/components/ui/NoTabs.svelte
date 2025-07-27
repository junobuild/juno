<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		info?: Snippet;
	}

	let { children, info }: Props = $props();
</script>

{@render info?.()}

<div class="no-tabs">
	{@render children()}
</div>

<style lang="scss">
	.no-tabs {
		margin: var(--padding) 0 var(--padding-4x);
	}
</style>
