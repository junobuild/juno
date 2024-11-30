<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [start]
	 * @property {import('svelte').Snippet} [center]
	 * @property {import('svelte').Snippet} [end]
	 */

	/** @type {Props} */
	let { start, center, end } = $props();
</script>

<div class="filters">
	<div class="start">
		{@render start?.()}
	</div>

	<div>
		{@render center?.()}
	</div>

	<div>
		{@render end?.()}
	</div>
</div>

<style lang="scss">
	@use '../../styles/mixins/grid';
	@use '../../styles/mixins/media';

	.filters {
		display: grid;
		grid-template-columns: repeat(2, calc((100% - var(--padding-1_5x)) / 2));

		column-gap: var(--padding-1_5x);
		padding: var(--padding-2x) 0;

		@include media.min-width(large) {
			grid-template-columns: repeat(3, calc((100% - (2 * var(--padding-4x))) / 3));

			gap: var(--padding-4x);
		}
	}

	.start {
		grid-column: 1 / 3;

		@include media.min-width(large) {
			grid-column: 1 / 2;
		}
	}
</style>
