<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		button?: HTMLButtonElement | undefined;
		disabled?: boolean;
		hidden?: boolean;
		icon?: Snippet;
		children: Snippet;
		onclick: () => Promise<void>;
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

<button type="button" {onclick} bind:this={button} class="icon" {disabled} class:hidden>
	{@render icon?.()}
	<span class="visually-hidden">{@render children()}</span>
</button>

<style lang="scss">
	.hidden {
		display: none;
	}
</style>
