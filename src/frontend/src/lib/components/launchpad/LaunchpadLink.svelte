<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot making the component unusable -->
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
