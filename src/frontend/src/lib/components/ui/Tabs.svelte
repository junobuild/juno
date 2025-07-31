<script lang="ts">
	import { notEmptyString } from '@dfinity/utils';
	import { getContext, type Snippet } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import { i18n } from '$lib/stores/i18n.store';
	import { onLayoutTitleIntersection } from '$lib/stores/layout-intersecting.store';
	import { type TabsContext, TABS_CONTEXT_KEY } from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';
	import { keyOf } from '$lib/utils/utils';

	interface Props {
		info?: Snippet;
		children: Snippet;
	}

	let { info, children }: Props = $props();

	const { store }: TabsContext = getContext<TabsContext>(TABS_CONTEXT_KEY);

	const selectTab = (tabId: symbol) => store.update((data) => ({ ...data, tabId }));

	afterNavigate(() => {
		const tabId = initTabId($store.tabs);
		selectTab(tabId);
	});

	const tabHref = (text: string | undefined): string => {
		const { url } = page;

		const currentUrl = URL.parse(url);
		const origin = currentUrl?.origin ?? url;
		const pathname = currentUrl?.pathname ?? '/';

		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const searchParams = new URLSearchParams(currentUrl?.search);
		searchParams.delete('tab');

		if (notEmptyString(text)) {
			searchParams.append('tab', text.toLowerCase());
		}

		const params = searchParams.toString();

		return `${origin}${pathname}${notEmptyString(params) ? `?${params}` : ''}`;
	};
</script>

{@render info?.()}

<div class="tabs" onjunoIntersecting={onLayoutTitleIntersection} use:onIntersection>
	{#each $store.tabs as { labelKey, id }, i (id)}
		{@const [group, key] = labelKey.split('.')}
		{@const obj = keyOf({ obj: $i18n, key: group })}
		{@const text = keyOf({ obj, key })}

		<a class="tab" class:selected={$store.tabId === id} href={tabHref(i !== 0 ? text : undefined)}
			>{text}</a
		>
	{/each}
</div>

{@render children()}

<style lang="scss">
	@use '../../styles/mixins/tabs';

	.tabs {
		margin: var(--padding) 0 var(--padding-4x);

		@include tabs.tabs;
	}

	.tab {
		@include tabs.tab;
	}
</style>
