<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { getContext, type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import DataActions from '$lib/components/data/DataActions.svelte';
	import ListParamsFilter from '$lib/components/list/ListParamsFilter.svelte';
	import DataOrder from '$lib/components/data/DataOrder.svelte';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';

	interface Props {
		children: Snippet;
		actions?: Snippet;
	}

	let { children, actions }: Props = $props();

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let collectionSelected = $derived(nonNullish($store.rule));
</script>

<div class="actions">
	<span>{@render children()}</span>

	{#if collectionSelected}
		<div transition:fade>
			<ListParamsFilter />
			<DataOrder />
			<DataActions>
				{@render actions?.()}
			</DataActions>
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
