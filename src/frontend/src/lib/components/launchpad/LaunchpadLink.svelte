<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		summary?: Snippet;
		children: Snippet;
		href: string;
		ariaLabel: string;
		size?: 'small' | 'default';
		row?: boolean;
		highlight?: boolean;
	}

	let {
		children,
		summary,
		href,
		ariaLabel,
		size = 'default',
		row = false,
		highlight = false
	}: Props = $props();
</script>

<a
	class="article"
	class:highlight
	class:row
	class:small={size === 'small'}
	aria-label={ariaLabel}
	{href}
>
	{#if nonNullish(summary)}
		<div class="summary">
			{@render summary()}
		</div>
	{/if}

	<div class="content" class:only={isNullish(summary)}>
		{@render children()}
	</div>
</a>

<style lang="scss">
	@use '../../styles/mixins/media';

	.summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--padding-2x);
		padding: var(--padding-4x) var(--padding-4x) var(--padding);
	}

	.content {
		padding: var(--padding-2x) var(--padding-4x) var(--padding);

		&:not(.only) {
			min-height: 150px;
		}
	}

	.content,
	.summary {
		width: 100%;

		:global(*::first-letter) {
			text-transform: uppercase;
		}
	}

	.row {
		grid-column: 1 / 13;

		height: auto;

		@include media.min-width(medium) {
			display: grid;
			grid-template-columns: 30% auto;
			grid-gap: var(--padding);
		}

		.content,
		.summary {
			width: 100%;

			@include media.min-width(medium) {
				width: auto;
			}
		}

		.summary {
			justify-content: flex-end;
			flex-direction: row-reverse;
			gap: var(--padding-3x);
			padding: var(--padding-2x) var(--padding-4x);
		}

		.content {
			display: flex;
			align-items: center;

			padding: var(--padding-2x) var(--padding-4x);
			min-height: auto;
			height: 100%;
		}
	}

	a.small {
		height: 100%;
		justify-content: center;
	}

	a.highlight {
		color: var(--color-primary);

		border: 2px solid var(--color-primary);
		box-shadow: 1px 1px var(--color-primary);

		&:hover:not(:disabled),
		&:focus:not(:disabled) {
			color: var(--color-primary);
		}
	}
</style>
