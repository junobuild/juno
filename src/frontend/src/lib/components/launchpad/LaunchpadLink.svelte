<script lang="ts">
	import { nonNullish } from '@dfinity/utils';

	export let href: string;
	export let ariaLabel: string;
	export let size: 'small' | 'default' = 'default';
	export let row = false;

	let summary = nonNullish($$slots.summary);
</script>

<a class="article" {href} aria-label={ariaLabel} class:small={size === 'small'} class:row>
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
		:global(*::first-letter) {
			text-transform: uppercase;
		}

		width: 100%;
	}

	.row {
		grid-column: 1 / 13;

		@include media.min-width(medium) {
			display: grid;
			grid-template-columns: 30% auto;
			grid-gap: var(--padding);
		}

		height: auto;

		.content,
		.summary {
			width: auto;
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
</style>
