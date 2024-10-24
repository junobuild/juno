<script lang="ts">
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import type { Rule } from '$declarations/satellite/satellite.did';
	import Collections from '$lib/components/collections/Collections.svelte';
	import CollectionsEmpty from '$lib/components/collections/CollectionsEmpty.svelte';
	import DataNav from '$lib/components/data/DataNav.svelte';
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { type TabsContext, TABS_CONTEXT_KEY } from '$lib/types/tabs.context';

	interface Props {
		children?: import('svelte').Snippet;
		count?: import('svelte').Snippet;
	}

	let { children, count }: Props = $props();

	// Rules
	const { store }: RulesContext = getContext<RulesContext>(RULES_CONTEXT_KEY);

	onMount(() => store.update((data) => ({ ...data, rule: undefined })));

	const selectionCollection = (rule: [string, Rule]) => {
		closeData();
		store.update((data) => ({ ...data, rule }));
	};

	// Data
	const dispatch = createEventDispatcher();
	const closeData = () => dispatch('junoCloseData');

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
	<DataNav
		on:junoCollectionEdit={({ detail }) => selectionCollection(detail)}
		on:junoCollectionClose={close}
	/>

	<Collections on:junoCollectionEdit={({ detail }) => selectionCollection(detail)} />

	{@render children?.()}

	<CollectionsEmpty on:click={() => selectTab()} />
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
