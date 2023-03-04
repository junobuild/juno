<script lang="ts">
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import { getContext } from 'svelte';
	import type { TabsContext } from '$lib/types/tabs.context';
	import { TABS_CONTEXT_KEY } from '$lib/types/tabs.context';
	import { onLayoutTitleIntersection } from '$lib/stores/layout.store';
	import { onIntersection } from '$lib/directives/intersection.directives';
	import { i18n } from '$lib/stores/i18n.store';

	export let help: string;

	const { store }: TabsContext = getContext<TabsContext>(TABS_CONTEXT_KEY);

	const selectTab = (tabId: symbol) => store.update((data) => ({ ...data, tabId }));
</script>

<div class="tabs" use:onIntersection on:junoIntersecting={onLayoutTitleIntersection}>
	{#each $store.tabs as { labelKey, id }}
		{@const [group, key] = labelKey.split('.')}

		<button class="text" on:click={() => selectTab(id)} class:selected={$store.tabId === id}
			>{$i18n[group][key]}</button
		>
	{/each}

	<ExternalLink href={help}>{$i18n.core.help}</ExternalLink>
</div>

<slot />

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
		gap: var(--padding-2x);

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
