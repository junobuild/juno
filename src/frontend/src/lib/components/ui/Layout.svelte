<script lang="ts">
	import SplitPane from '$lib/components/ui/SplitPane.svelte';
	import { layoutTitle } from '$lib/stores/layout.store';
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';

	export let centered = false;
	export let title = true;
	export let topMargin: 'default' | 'wide' = 'default';
</script>

<SplitPane>
	<slot name="menu" slot="menu" />

	<div class="content">
		<slot name="navbar" />

		<div class="page">
			<main class:centered>
				{#if title}
					{#if nonNullish($layoutTitle)}
						<h1 in:fade class:space={topMargin === 'wide'}>
							<span>
								<span class="icon"><svelte:component this={$layoutTitle.icon} size="32px" /></span>
								<span>{$layoutTitle.title}</span>
							</span>
						</h1>
					{:else}
						<span class="empty">&ZeroWidthSpace;</span>
					{/if}
				{/if}

				<slot />
			</main>

			<slot name="footer" />
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
		max-width: calc(media.$breakpoint-extra-large - 100px);
		overflow-x: hidden;

		padding: 0 var(--padding-2x) var(--padding-4x);

		position: relative;
		min-height: calc(100% - var(--footer-height));

		@include media.min-width(xlarge) {
			padding: 0 var(--padding-10x) var(--padding-2x);
		}
	}

	.centered {
		margin: 0 auto;

		@include media.min-width(xlarge) {
			min-height: calc(100vh - var(--header-height) - calc((var(--padding) * 14) - 3px));
		}
	}

	h1 {
		letter-spacing: -0.03rem;
		line-height: var(--line-height-standard);

		padding: 0 var(--padding-2x) 0 0;
		margin: var(--padding-3x) 0;

		&.space {
			@include media.min-width(medium) {
				margin: var(--padding-10x) 0 var(--padding-3x);
			}
		}

		display: inline-block;

		@include text.truncate;
		max-width: 100%;
	}

	.icon {
		vertical-align: sub;
	}

	.empty {
		display: block;
		height: 99.5px;
	}
</style>
