<script lang="ts">
	import { notEmptyString } from '@dfinity/utils';
	import { getContext, type Snippet } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import { i18n } from '$lib/stores/i18n.store';
	import { onLayoutTitleIntersection } from '$lib/stores/layout-intersecting.store';
	import { type TabsContext, TABS_CONTEXT_KEY } from '$lib/types/tabs.context';
	import { initTabId } from '$lib/utils/tabs.utils';
	import { keyOf } from '$lib/utils/utils';

	interface Props {
		help?: string;
		info?: Snippet;
		children: Snippet;
	}

	let { help, info, children }: Props = $props();

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

<div class="tabs" use:onIntersection onjunoIntersecting={onLayoutTitleIntersection}>
	{#each $store.tabs as { labelKey, id }, i (id)}
		{@const [group, key] = labelKey.split('.')}
		{@const obj = keyOf({ obj: $i18n, key: group })}
		{@const text = keyOf({ obj, key })}

		<a href={tabHref(i !== 0 ? text : undefined)} class="tab" class:selected={$store.tabId === id}
			>{text}</a
		>
	{/each}

	{#if notEmptyString(help)}
		<ExternalLink href={help}>{$i18n.core.help}</ExternalLink>
	{/if}
</div>

{@render children()}

<style lang="scss">
	@mixin button {
		position: relative;

		text-decoration: none;

		margin: 0 var(--padding-2x) 0 0;
		padding: 1px var(--padding);

		color: var(--label-color);

		border-radius: var(--border-radius);

		transition: all var(--animation-time) ease-out;
	}

	@mixin hover {
		background: var(--color-primary);
		color: var(--color-primary-contrast);
	}

	.tabs {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--padding);

		margin: var(--padding) 0 var(--padding-1_5x);

		:global(a:not(.tab)) {
			@include button;
			border-radius: var(--border-radius);
			margin: 0;

			&:hover,
			&:focus {
				@include hover;
			}
		}
	}

	.tab {
		@include button;

		&:hover,
		&:focus {
			@include hover;
		}

		&:not(:focus):not(:hover) {
			&.selected {
				background: var(--color-secondary);
				color: var(--color-secondary-contrast);
			}
		}
	}
</style>
