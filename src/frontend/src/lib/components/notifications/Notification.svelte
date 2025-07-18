<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		href: string;
		close: () => void;
		icon: Snippet;
		badge?: Snippet;
		children: Snippet;
	}

	let { href, close, icon, badge, children }: Props = $props();
</script>

<a {href} class="menu" role="menuitem" aria-haspopup="menu" onclick={close}>
	<span class="icon">
		{@render icon()}
		{#if nonNullish(badge)}
			<span class="indicator">{@render badge()}</span>
		{/if}
	</span>
	<span class="text">{@render children()}</span>
</a>

<style lang="scss">
	@use '../../styles/mixins/text';

	a {
		gap: var(--padding-2x);
	}

	.icon {
		position: relative;

		padding: var(--padding) var(--padding-0_5x) var(--padding-0_5x);

		align-self: flex-start;

		&:global {
			svg {
				width: auto;
				height: auto;
				margin: 0;
			}
		}
	}

	.indicator {
		position: absolute;
		right: calc(-1 * var(--padding-0_5x));
		top: var(--padding-0_25x);
	}

	.text {
		@include text.clamp(3);
	}
</style>
