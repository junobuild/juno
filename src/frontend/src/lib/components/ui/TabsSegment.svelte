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
		width: fit-content;

		background: var(--color-card-contrast);
		color: var(--color-card);
		border: 1px solid var(--card-border-color, var(--color-card-contrast));
		border-radius: var(--border-radius);

		margin: var(--padding) 0 var(--padding-1_5x);

		@include tabs.tabs;
	}

	.tab {
		border: 1px solid var(--card-border-color, var(--color-card-contrast));

		border-radius: var(--border-radius);

		margin: 0;

		&:not(:focus):not(:hover) {
			&.selected {
				color: var(--color-card-contrast);
				background: var(--color-card);
			}
		}

		@include tabs.tab;
	}
</style>
