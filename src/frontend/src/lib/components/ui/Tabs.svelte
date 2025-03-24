<script lang="ts">
	import { getContext, type Snippet } from 'svelte';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import { i18n } from '$lib/stores/i18n.store';
	import { onLayoutTitleIntersection } from '$lib/stores/layout-intersecting.store';
	import { type TabsContext, TABS_CONTEXT_KEY } from '$lib/types/tabs.context';
	import { keyOf } from '$lib/utils/utils';

	interface Props {
		help: string;
		info?: Snippet;
		children: Snippet;
	}

	let { help, info, children }: Props = $props();

	const { store }: TabsContext = getContext<TabsContext>(TABS_CONTEXT_KEY);

	const selectTab = (tabId: symbol) => store.update((data) => ({ ...data, tabId }));
</script>

{@render info?.()}

<div class="tabs" use:onIntersection onjunoIntersecting={onLayoutTitleIntersection}>
	{#each $store.tabs as { labelKey, id } (id)}
		{@const [group, key] = labelKey.split('.')}
		{@const obj = keyOf({ obj: $i18n, key: group })}
		{@const text = keyOf({ obj, key })}

		<button class="text" onclick={() => selectTab(id)} class:selected={$store.tabId === id}
			>{text}
		</button>
	{/each}

	<ExternalLink href={help}>{$i18n.core.help}</ExternalLink>
</div>

{@render children()}

<style lang="scss">
	@mixin button {
		text-decoration: none;
		position: relative;
		margin: 0 var(--padding-2x) 0 0;
		color: var(--label-color);
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

		:global(a) {
			@include button;
			border-radius: var(--border-radius);
			margin: 0;

			&:hover,
			&:focus {
				@include hover;
			}
		}
	}

	button.text {
		@include button;

		&:hover,
		&:focus {
			@include hover;
		}
	}

	.selected {
		&.text {
			color: var(--text-color);
		}

		&:hover,
		&:focus {
			@include hover;
		}
	}
</style>
