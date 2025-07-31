<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import IconUnfoldLess from '$lib/components/icons/IconUnfoldLess.svelte';
	import IconUnfoldMore from '$lib/components/icons/IconUnfoldMore.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { handleKeyPress } from '$lib/utils/keyboard.utils';

	interface Props {
		id?: string;
		initiallyExpanded?: boolean;
		maxContentHeight?: number;
		wrapHeight?: boolean;
		expanded?: boolean;
		header: Snippet;
		children: Snippet;
	}

	let {
		id,
		initiallyExpanded = false,
		expanded = $bindable(initiallyExpanded),
		maxContentHeight,
		wrapHeight = false,
		header,
		children
	}: Props = $props();

	// Minimum height when some part of the text-content is visible (empirical value)
	const CONTENT_MIN_HEIGHT = 40;

	let container = $state<HTMLDivElement | undefined>();
	let userUpdated = $state(false);
	let maxHeight = $state<number | undefined>();

	export const close = () => {
		if (!expanded) {
			return;
		}

		toggleContent();
	};

	export const open = () => {
		if (expanded) {
			return;
		}

		toggleContent();
	};

	const toggleContent = () => {
		userUpdated = true;
		expanded = !expanded;
	};

	const calculateMaxContentHeight = (): number => {
		if (nonNullish(maxContentHeight)) {
			return maxContentHeight;
		}
		const height = container?.getBoundingClientRect().height ?? container?.offsetHeight ?? 0;
		return height < CONTENT_MIN_HEIGHT ? CONTENT_MIN_HEIGHT : height;
	};
	const maxHeightStyle = (height: number | undefined): string =>
		isNullish(height) ? '' : `max-height: ${height}px;`;
	// In case of `initiallyExpanded=true` we should avoid calculating `max-height` from the content-height
	// because the content in the slot can be initialized w/ some delay.
	const updateMaxHeight = () => {
		if (userUpdated) {
			maxHeight = expanded ? calculateMaxContentHeight() : 0;
		} else {
			maxHeight = initiallyExpanded ? maxContentHeight : 0;
		}
	};
	// Avoid to show scroll if not necessary
	const overflyYStyle = (height: number | undefined): string =>
		isNullish(height) || isNullish(maxContentHeight)
			? 'overflow-y: hidden;'
			: height < maxContentHeight
				? 'overflow-y: hidden;'
				: 'overflow-y: auto;';

	// recalculate max-height after DOM update
	$effect(updateMaxHeight);

	const toggle = () => toggleContent();
</script>

<div class="collapsible">
	<div
		id={nonNullish(id) ? `heading${id}` : undefined}
		class="header"
		onclick={toggle}
		onkeypress={($event) => handleKeyPress({ $event, callback: toggle })}
		role="button"
		tabindex="-1"
	>
		<button
			class="square"
			class:expanded
			aria-controls={id}
			aria-expanded={expanded}
			tabindex="-1"
			title={expanded ? $i18n.core.collapse : $i18n.core.expand}
			type="button"
		>
			{#if expanded}
				<span class="icon" in:fade><IconUnfoldLess size="16px" /></span>
			{:else}
				<span class="icon" in:fade><IconUnfoldMore size="16px" /></span>
			{/if}
		</button>
		{@render header()}
	</div>
	<div
		style={`${maxHeightStyle(maxHeight)}${overflyYStyle(maxHeight)}`}
		class="wrapper"
		class:expanded
		role="definition"
	>
		<div
			bind:this={container}
			{id}
			class="content"
			class:wrapHeight
			aria-labelledby={nonNullish(id) ? `heading${id}` : undefined}
		>
			{@render children()}
		</div>
	</div>
</div>

<style lang="scss">
	@use '../../styles/mixins/interaction';
	@use '../../styles/mixins/media';

	.collapsible {
		margin: var(--padding-1_5x) 0 var(--padding-4x);
	}

	.header {
		position: relative;

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: row-reverse;
		gap: var(--padding);

		outline: none;

		color: var(--placeholder-color);
		font-size: var(--font-size-very-small);

		@include interaction.tappable;
		user-select: none;

		&:focus {
			filter: contrast(1.25);
		}
	}

	button {
		border-color: transparent;
		background-color: transparent;
	}

	.wrapper {
		margin-top: 0;
		opacity: 0;
		visibility: hidden;

		transition: all var(--animation-time);

		height: fit-content;
		overflow: hidden;

		&.expanded {
			margin-top: var(--padding);
			opacity: 1;
			visibility: initial;
		}
	}

	.content {
		// to respect children margins in contentHeight calculation
		overflow: auto;

		&:not(.wrapHeight) {
			// to not stick the content to the bottom
			padding-bottom: var(--padding);
		}
	}

	.icon {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
