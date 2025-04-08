<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		color: 'primary' | 'secondary' | 'tertiary';
	}

	let { children, color }: Props = $props();
</script>

<div class={color}>
	{@render children()}
</div>

<style lang="scss">
	div {
		border-radius: var(--border-radius);

		margin: var(--padding-0_25x) 0;
		padding: var(--padding-0_25x) var(--padding);

		font-size: var(--font-size-very-small);

		width: fit-content;
	}

	.primary {
		color: var(--color-primary-contrast);
		background: rgba(var(--color-primary-rgb), 0.6);
		border: 1px solid var(--color-primary);
	}

	.secondary {
		color: var(--color-secondary-contrast);
		background: rgba(var(--color-secondary-rgb), 0.6);
		border: 1px solid var(--color-secondary);
	}

	.tertiary {
		color: var(--color-tertiary-contrast);
		background: rgba(var(--color-tertiary-rgb), 0.6);
		border: 1px solid var(--color-tertiary);
	}
</style>
