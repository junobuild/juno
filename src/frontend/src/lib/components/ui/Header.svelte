<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		hide?: boolean;
		children: Snippet;
		banner?: Snippet;
	}

	let { hide = false, banner, children }: Props = $props();
</script>

<header class:hide class:with-banner={nonNullish(banner)}>
	{@render banner?.()}

	<div class="content">
		{@render children()}
	</div>
</header>

<style lang="scss">
	@use '../../styles/mixins/media';

	header {
		position: absolute;
		top: 0;
		left: 0;

		width: 100%;

		--height: var(--header-height);

		z-index: calc(var(--z-index) + 2);

		pointer-events: none;

		transition:
			top ease-in var(--navbar-animation-time),
			background ease-in-out var(--animation-time);

		&.hide {
			background: rgba(var(--color-background-rgb), 0.9);
		}

		&.with-banner {
			--height: calc(var(--header-height) + var(--banner-height));
		}

		@include media.min-width(xlarge) {
			&.hide {
				top: calc(-1 * var(--height));
				background: initial;
			}
		}

		:global(*) {
			pointer-events: all;
		}
	}

	.content {
		display: flex;
		justify-content: space-between;
		align-items: center;

		height: var(--header-height);

		color: var(--color-background-contrast);

		padding: var(--padding-2x) var(--padding-2x);

		@include media.min-width(xlarge) {
			padding: calc(var(--padding-4x) - 1px) var(--padding-7x) var(--padding-4x);
		}
	}
</style>
