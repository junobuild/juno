<script lang="ts">
	import { RULES_CONTEXT_KEY, type RulesContext } from '$lib/types/rules.context';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import Collections from '$lib/components/collections/Collections.svelte';
	import type { Rule } from '$declarations/satellite/satellite.did';
	import DataNav from '$lib/components/data/DataNav.svelte';
	import CollectionsEmpty from '$lib/components/collections/CollectionsEmpty.svelte';
	import type { TabsContext } from '$lib/types/tabs.context';
	import { TABS_CONTEXT_KEY } from '$lib/types/tabs.context';

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

	<slot />

	<CollectionsEmpty on:click={() => selectTab()} />
</section>

<div class="count">
	<slot name="count" />
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
