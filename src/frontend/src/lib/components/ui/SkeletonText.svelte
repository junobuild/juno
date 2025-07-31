<script lang="ts">
	interface Props {
		animated?: boolean;
		tagName?: 'span' | 'p' | 'h1' | 'h2' | 'h3';
	}

	let { animated = true, tagName = 'span' }: Props = $props();
</script>

<div class="skeleton-text" class:animated aria-busy="true" data-tid="skeleton-text">
	<svelte:element this={tagName}>&nbsp;</svelte:element>
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	.skeleton-text {
		display: block;

		width: 100%;
		height: inherit;

		margin: var(--skeleton-text-padding, 0 0 var(--padding-1_5x));

		--skeleton-text-background: rgba(var(--color-secondary-rgb), 0.25);
		--skeleton-text-background-animated: rgba(var(--color-secondary-rgb), 0.135);
		background: var(--skeleton-text-background);

		line-height: 1.05;

		user-select: none;
		pointer-events: none;

		border-radius: 2px;

		* {
			display: inline-block;
		}
	}

	@include media.dark-theme {
		.skeleton-text {
			--skeleton-text-background: rgba(var(--color-background-contrast-rgb), 0.065);
			--skeleton-text-background-animated: rgba(var(--color-background-contrast-rgb), 0.135);
		}
	}

	.animated {
		position: relative;

		background: linear-gradient(
			to right,
			var(--skeleton-text-background) 8%,
			var(--skeleton-text-background-animated) 18%,
			var(--skeleton-text-background) 33%
		);
		background-size: 800px 104px;
		animation-duration: 1s;
		animation-fill-mode: forwards;
		animation-iteration-count: infinite;
		animation-name: skeleton-text-shimmer;
		animation-timing-function: linear;
	}

	/* -global- */
	@keyframes -global-skeleton-text-shimmer {
		0% {
			background-position: -400px 0;
		}

		100% {
			background-position: 400px 0;
		}
	}
</style>
