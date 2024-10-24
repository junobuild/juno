<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { getContext } from 'svelte';
	import { run } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import DataActions from '$lib/components/data/DataActions.svelte';
	import DataFilter from '$lib/components/data/DataFilter.svelte';
	import DataOrder from '$lib/components/data/DataOrder.svelte';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';

	interface Props {
		children?: import('svelte').Snippet;
		actions?: import('svelte').Snippet;
	}

	let { children, actions }: Props = $props();

	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	let collectionSelected = $state(false);
	run(() => {
		collectionSelected = nonNullish($store.rule);
	});
</script>

<div class="actions">
	<span>{@render children?.()}</span>

	{#if collectionSelected}
		<div transition:fade>
			<DataFilter />
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
