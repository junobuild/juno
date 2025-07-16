<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		button?: HTMLButtonElement | undefined;
		disabled?: boolean;
		hidden?: boolean;
		icon?: Snippet;
		children: Snippet;
		onclick: (() => Promise<void>) | (() => void);
	}

	let {
		button = $bindable(undefined),
		disabled = false,
		hidden = false,
		icon,
		children,
		onclick
	}: Props = $props();
</script>

<button type="button" {onclick} bind:this={button} class="icon rounded" {disabled} class:hidden>
	{@render icon?.()}
	<span class="visually-hidden">{@render children()}</span>
</button>

<style lang="scss">
	.rounded {
		border-radius: var(--border-radius);

		border: 1px solid var(--text-color);

		width: var(--padding-4x);
		height: var(--padding-4x);

		padding: 0;
	}

	.hidden {
		display: none;
	}
</style>
