<script lang="ts">
	import { getContext, onMount, type Snippet } from 'svelte';
	import CollectionSelection from '$lib/components/collections/CollectionSelection.svelte';
	import CollectionsEmpty from '$lib/components/collections/CollectionsEmpty.svelte';
	import DataNav from '$lib/components/data/DataNav.svelte';
	import IconVisibility from '$lib/components/icons/IconVisibility.svelte';
	import IconVisibilityOff from '$lib/components/icons/IconVisibilityOff.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CollectionRule } from '$lib/types/collection';
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

	const selectionCollection = (rule: CollectionRule | undefined) => {
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

	let includeSysCollections = $state(false);
</script>

<section>
	<DataNav onedit={selectionCollection} onclose={close} />

	<CollectionSelection {includeSysCollections} onedit={selectionCollection}>
		{#snippet includeSysCollectionsAction()}
			<button
				class="menu"
				type="button"
				onclick={() => (includeSysCollections = !includeSysCollections)}
			>
				{#if includeSysCollections}
					<IconVisibilityOff size="20px" /> {$i18n.collections.hide_system_collections}
				{:else}
					<IconVisibility size="20px" /> {$i18n.collections.show_system_collections}
				{/if}</button
			>
		{/snippet}
	</CollectionSelection>

	{@render children()}

	{#if !includeSysCollections}
		<CollectionsEmpty onclick={selectTab} />
	{/if}
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
