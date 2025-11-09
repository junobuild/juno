<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { getContext } from 'svelte';
	import IconNavigateNext from '$lib/components/icons/IconNavigateNext.svelte';
	import { PAGINATION_CONTEXT_KEY } from '$lib/types/pagination.context';

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { store, previousPage, nextPage, list } = getContext(PAGINATION_CONTEXT_KEY);

	const prev = async () => {
		previousPage();
		await list();
	};

	const next = async () => {
		nextPage();
		await list();
	};
</script>

{#if nonNullish($store.pages) && $store.pages > 0}
	<nav class="pagination">
		<button
			class="square"
			class:visible={$store.selectedPage > 0}
			aria-label="Previous page of data"
			onclick={prev}><IconNavigateNext navigate="previous" /></button
		>
		<button
			class="square"
			class:visible={$store.pages > $store.selectedPage + 1}
			aria-label="Next page of data"
			onclick={next}><IconNavigateNext /></button
		>
	</nav>
{/if}

<style lang="scss">
	@use '../../styles/mixins/collections';

	.pagination {
		@include collections.toolbar;

		button {
			visibility: hidden;
			opacity: 0;

			&.visible {
				visibility: visible;
				opacity: 1;

				transition: opacity 0.15s ease-out;
			}
		}
	}
</style>
