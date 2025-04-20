<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import SplitPane from '$lib/components/ui/SplitPane.svelte';
	import { layoutTitle } from '$lib/derived/layout-title.derived';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';

	interface Props {
		centered?: boolean;
		fullWidth?: boolean;
		title?: boolean;
		topMargin?: 'default' | 'wide';
		menu?: Snippet;
		navbar?: Snippet;
		children: Snippet;
		footer?: Snippet;
	}

	let {
		centered = false,
		fullWidth = false,
		title = true,
		topMargin = 'default',
		menu,
		navbar,
		children,
		footer
	}: Props = $props();
</script>

<SplitPane {menu}>
	<div class="content">
		{@render navbar?.()}

		<div class="page">
			<main class:centered class:full-width={fullWidth} class:with-footer={nonNullish(footer)}>
				{#if title}
					{#if nonNullish($layoutNavigation)}
						{@const SvelteComponent = $layoutNavigation.data.icon}
						<h1 in:fade class:space={topMargin === 'wide'}>
							<span>
								<span class="icon"><SvelteComponent size="32px" /></span>
								<span>{$layoutTitle ?? ''}</span>
							</span>
						</h1>
					{:else}
						<span class="empty" class:space={topMargin === 'wide'}>&ZeroWidthSpace;</span>
					{/if}
				{/if}

				{@render children()}
			</main>

			{@render footer?.()}
		</div>
	</div>
</SplitPane>

<style lang="scss">
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/text';

	.content {
		position: relative;
		width: 100%;
		min-width: 100%;

		@include media.min-width(large) {
			min-width: auto;
		}
	}

	.page {
		height: 100%;
		overflow-y: auto;

		padding: var(--header-height) 0 0;
	}

	main {
		max-width: 1440px;
		overflow-x: hidden;

		padding: 0 var(--padding-2x) var(--padding-6x);

		transition: max-width var(--animation-time) var(--menu-animation-timing-function);

		&.full-width {
			max-width: 100%;
		}

		@include media.min-width(xlarge) {
			padding: 0 var(--padding-10x) var(--padding-6x);
		}
	}

	.with-footer {
		min-height: calc(100vh - var(--header-height));
	}

	.centered {
		margin: 0 auto;
	}

	.empty,
	h1 {
		letter-spacing: -0.03rem;
		line-height: var(--line-height-standard);

		display: inline-block;

		@include text.truncate;
		max-width: 100%;

		padding: var(--padding-3x) 0 var(--padding-2x);
		margin: 0;

		&.space {
			@include media.min-width(medium) {
				padding: var(--padding-6x) 0 var(--padding-2x);
			}
		}
	}

	.icon {
		vertical-align: sub;
	}

	.empty {
		display: block;
		height: 63.5px;
	}
</style>
