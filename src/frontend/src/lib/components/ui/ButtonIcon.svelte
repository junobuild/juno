<script lang="ts">
	import { createBubbler } from 'svelte/legacy';
	import type { Snippet } from 'svelte';

	const bubble = createBubbler();

	interface Props {
		button?: HTMLButtonElement | undefined;
		disabled?: boolean;
		hidden?: boolean;
		icon?: Snippet;
		children?: Snippet;
	}

	let {
		button = $bindable(undefined),
		disabled = false,
		hidden = false,
		icon,
		children
	}: Props = $props();
</script>

<button
	type="button"
	onclick={bubble('click')}
	bind:this={button}
	class="icon"
	{disabled}
	class:hidden
>
	{@render icon?.()}
	<span class="visually-hidden">{@render children?.()}</span>
</button>

<style lang="scss">
	.hidden {
		display: none;
	}
</style>
