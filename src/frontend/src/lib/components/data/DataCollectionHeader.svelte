<script lang="ts">
	import DataOrder from '$lib/components/data/DataOrder.svelte';
	import DataFilter from '$lib/components/data/DataFilter.svelte';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { getContext } from 'svelte';
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let collectionSelected = false;
	$: collectionSelected = nonNullish($store.rule);
</script>

<div class="actions">
	<span><slot /></span>

	{#if collectionSelected}
		<div transition:fade>
			<DataFilter />
			<DataOrder />
			<!--			<DataActions>TODO</DataActions>-->
		</div>
	{/if}
</div>

<style lang="scss">
	.actions {
		display: flex;
		justify-content: space-between;
	}

	div {
		display: flex;
		gap: var(--padding-1_5x);
	}
</style>
