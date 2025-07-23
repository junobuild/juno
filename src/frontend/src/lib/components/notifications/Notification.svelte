<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		icon: Snippet;
		badge?: Snippet;
		children: Snippet;
	}

	let { icon, badge, children }: Props = $props();
</script>

<span class="notification">
	<span class="icon">
		{@render icon()}
		{#if nonNullish(badge)}
			<span class="indicator">{@render badge()}</span>
		{/if}
	</span>
	{@render children()}
</span>

<style lang="scss">
	.notification {
		display: flex;
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
</style>
