<script lang="ts">
	import { nonNullish } from '@dfinity/utils';

	export let href: string;
	export let ariaLabel: string;
	export let size: 'small' | 'default' = 'default';

	let summary = nonNullish($$slots.summary);
</script>

<a class="article" {href} aria-label={ariaLabel} class:small={size === 'small'}>
	{#if summary}
		<div class="summary">
			<slot name="summary" />
		</div>
	{/if}

	<div class="content" class:only={!summary}>
		<slot />
	</div>
</a>

<style lang="scss">
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
		:global(*::first-letter) {
			text-transform: uppercase;
		}

		width: 100%;
	}
</style>
