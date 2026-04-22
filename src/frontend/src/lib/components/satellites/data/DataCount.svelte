<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { getContext } from 'svelte';
	import { PAGINATION } from '$lib/constants/app.constants';
	import { PAGINATION_CONTEXT_KEY } from '$lib/types/pagination.context';

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { store } = getContext(PAGINATION_CONTEXT_KEY);

	let start: number = $derived(1 * $store.selectedPage * Number(PAGINATION) + 1);
</script>

{#if nonNullish($store.itemsLength) && nonNullish($store.matchesLength)}
	<p><small>{start} – {start + $store.itemsLength - 1} of {$store.matchesLength}</small></p>
{/if}

<style lang="scss">
	p {
		text-align: right;
		padding: 0 var(--padding) 0 0;
	}

	small {
		font-size: var(--font-size-very-small);
	}
</style>
