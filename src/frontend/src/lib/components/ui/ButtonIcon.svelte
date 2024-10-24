<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();

	interface Props {
		button?: HTMLButtonElement | undefined;
		disabled?: boolean;
		hidden?: boolean;
		icon?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
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
