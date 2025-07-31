<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		summary?: Snippet;
		children: Snippet;
		disabled?: boolean;
		primary?: boolean;
		row?: boolean;
		onclick: () => Promise<void>;
	}

	let { children, summary, disabled, primary = false, row = false, onclick }: Props = $props();
</script>

<button class="article" class:primary class:row {disabled} {onclick}>
	{#if nonNullish(summary)}
		<div class="summary">
			{@render summary()}
		</div>
	{/if}

	<div class="content" class:only={isNullish(summary)}>
		{@render children()}
	</div>
</button>

<style lang="scss">
	button {
		height: 100%;
		min-height: 231px;
		margin: 0;

		&.primary {
			--color-card-contrast: var(--color-primary);
		}
	}

	.summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--padding-4x) var(--padding-4x) var(--padding);
	}

	.content {
		padding: var(--padding-2x) var(--padding-4x) var(--padding);
		min-height: 150px;
	}

	.content,
	.summary {
		width: 100%;

		:global(*::first-letter) {
			text-transform: uppercase;
		}
	}

	.only {
		height: 100%;
	}

	.row {
		grid-column: 1 / 13;
		min-height: 58px;

		.content {
			display: flex;
			align-items: center;

			padding: var(--padding-2x) var(--padding-4x);
			min-height: auto;
		}
	}
</style>
