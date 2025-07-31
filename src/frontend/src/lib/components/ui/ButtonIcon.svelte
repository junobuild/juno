<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		button?: HTMLButtonElement | undefined;
		disabled?: boolean;
		hidden?: boolean;
		icon?: Snippet;
		children: Snippet;
		onclick: (() => Promise<void>) | (() => void);
		level?: 'success' | 'warning' | 'error';
		small?: boolean;
	}

	let {
		button = $bindable(undefined),
		disabled = false,
		hidden = false,
		icon,
		children,
		onclick,
		level,
		small = false
	}: Props = $props();
</script>

<button
	bind:this={button}
	class={`icon rounded ${level ?? ''}`}
	class:hidden
	class:small
	{disabled}
	{onclick}
	type="button"
>
	{@render icon?.()}
	<span class="visually-hidden">{@render children()}</span>
</button>

<style lang="scss">
	.icon {
		background: var(--color-background);
		color: var(--color-background-contrast);
	}

	.rounded {
		border-radius: 50%;

		border: 1px solid var(--text-color);

		--button-icon-size: calc(var(--padding-4x) + var(--padding-0_5x));

		width: var(--button-icon-size);
		height: var(--button-icon-size);

		padding: 0;

		&.small {
			--button-icon-size: calc(var(--padding-4x) - var(--padding-0_5x));
		}
	}

	.hidden {
		display: none;
	}
</style>
