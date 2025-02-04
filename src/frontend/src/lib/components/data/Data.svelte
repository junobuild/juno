<script lang="ts">
	import { getContext, onMount, type Snippet } from 'svelte';
	import type { Rule } from '$declarations/satellite/satellite.did';
	import Collections from '$lib/components/collections/Collections.svelte';
	import CollectionsEmpty from '$lib/components/collections/CollectionsEmpty.svelte';
	import DataNav from '$lib/components/data/DataNav.svelte';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { type TabsContext, TABS_CONTEXT_KEY } from '$lib/types/tabs.context';

	interface Props {
		children: Snippet;
		count?: Snippet;
		onclose: () => void;
	}

	let { children, count, onclose }: Props = $props();

	// Rules
	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	onMount(() => store.update((data) => ({ ...data, rule: undefined })));

	const selectionCollection = (rule: [string, Rule] | undefined) => {
		closeData();
		store.update((data) => ({ ...data, rule }));
	};

	// Data
	const closeData = () => onclose();

	// Tabs
	const { store: tabsStore }: TabsContext = getContext<TabsContext>(TABS_CONTEXT_KEY);
	const selectTab = () => tabsStore.update((data) => ({ ...data, tabId: data.tabs[1].id }));

	// Cross stores
	const close = () => {
		closeData();
		store.update((data) => ({ ...data, rule: undefined }));
	};
</script>

<section>
	<DataNav onedit={selectionCollection} onclose={close} />

	<Collections onedit={selectionCollection} />

	{@render children()}

	<CollectionsEmpty onclick={selectTab} />
</section>

<div class="count">
	{@render count?.()}
</div>

<style lang="scss">
	@use '../../styles/mixins/collections';

	section {
		@include collections.section;
	}

	.count {
		margin: var(--padding-2x) 0 0;
	}
</style>
