<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		opaque?: boolean;
		children: Snippet;
	}

	let { opaque = false, children }: Props = $props();
</script>

<header class:opaque>
	{@render children()}
</header>

<style lang="scss">
	@use '../../styles/mixins/media';

	header {
		position: absolute;
		top: 0;
		left: 0;

		width: 100%;
		height: var(--header-height);

		z-index: calc(var(--z-index) + 2);

		display: flex;
		justify-content: space-between;
		align-items: center;

		color: var(--color-background-contrast);

		pointer-events: none;

		padding: var(--padding-2x) var(--padding-2x);

		transition: border-bottom-color var(--animation-time);
		border-bottom: 1px solid transparent;

		@include media.min-width(xlarge) {
			padding: calc(var(--padding-4x) - 1px) var(--padding-7x) var(--padding-4x);
		}

		&.opaque {
			background: var(--color-background);
			border-bottom: 1px solid var(--color-background-contrast);
		}

		:global(*) {
			pointer-events: all;
		}
	}
</style>
