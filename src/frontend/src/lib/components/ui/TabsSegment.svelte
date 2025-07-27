<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { TABS_CONTEXT_KEY, type TabsContext } from '$lib/types/tabs.context';
	import { keyOf } from '$lib/utils/utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const { store }: TabsContext = getContext<TabsContext>(TABS_CONTEXT_KEY);

	const selectTab = (tabId: symbol) => store.update((data) => ({ ...data, tabId }));
</script>

<div class="tabs">
	{#each $store.tabs as { labelKey, id } (id)}
		{@const [group, key] = labelKey.split('.')}
		{@const obj = keyOf({ obj: $i18n, key: group })}
		{@const text = keyOf({ obj, key })}

		<button class="text tab" class:selected={$store.tabId === id} onclick={() => selectTab(id)}
			>{text}</button
		>
	{/each}
</div>

{@render children()}

<style lang="scss">
	@use '../../styles/mixins/tabs';

	.tabs {
		margin: var(--padding) 0 var(--padding-1_5x);

		@include tabs.tabs;
	}

	.tab {
		margin: 0;

		@include tabs.tab;
	}
</style>
