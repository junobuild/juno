<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		icon: Snippet;
		children: Snippet;
	}

	let { icon, children }: Props = $props();
</script>

<div>
	{@render icon()}

	{@render children()}
</div>

<style lang="scss">
	div {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--padding-2x);
	}
</style>
