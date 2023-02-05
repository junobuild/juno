<script lang="ts">
	import { nonNullish } from '$lib/utils/utils';
	import IconNavigateNext from '$lib/components/icons/IconNavigateNext.svelte';
	import { PAGINATION_CONTEXT_KEY } from '$lib/types/pagination.context';
	import { getContext } from 'svelte';

	// @ts-ignore
	// eslint-disable-line not type to not pass the generic
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
			on:click={prev}
			class:visible={$store.selectedPage > 0}
			aria-label="Previous page of data"
			class="square"><IconNavigateNext navigate="previous" /></button
		>
		<button
			on:click={next}
			class:visible={$store.pages > $store.selectedPage + 1}
			aria-label="Next page of data"
			class="square"><IconNavigateNext /></button
		>
	</nav>
{/if}

<style lang="scss">
	.pagination {
		display: flex;
		justify-content: center;
		gap: var(--padding-2x);
		margin: var(--padding-0_5x) 0 var(--padding);
		width: 100%;

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
