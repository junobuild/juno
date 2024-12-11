<!-- @migration-task Error while migrating Svelte code: Can't migrate code with afterUpdate. Please migrate by hand. -->
<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { afterUpdate } from 'svelte';
	import IconChevron from '$lib/components/icons/IconChevron.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { handleKeyPress } from '$lib/utils/keyboard.utils';

	// TODO: migrate to Svelte v5
	// e.g. afterUpdate cannot be used in runes mode

	export let id: string | undefined = undefined;
	export let initiallyExpanded = false;
	export let maxContentHeight: number | undefined = undefined;

	export let wrapHeight = false;

	// Minimum height when some part of the text-content is visible (empirical value)
	const CONTENT_MIN_HEIGHT = 40;

	export let expanded = initiallyExpanded;
	let container: HTMLDivElement | undefined;
	let userUpdated = false;
	let maxHeight: number | undefined;

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

	export const toggleContent = () => {
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
	afterUpdate(updateMaxHeight);

	const toggle = () => toggleContent();
</script>

<div class="collapsible">
	<div
		id={nonNullish(id) ? `heading${id}` : undefined}
		role="button"
		class="header"
		on:click={toggle}
		on:keypress={($event) => handleKeyPress({ $event, callback: toggle })}
		tabindex="-1"
	>
		<button
			type="button"
			class="square"
			class:expanded
			aria-expanded={expanded}
			aria-controls={id}
			title={expanded ? $i18n.core.collapse : $i18n.core.expand}
			tabindex="-1"
		>
			<IconChevron size="16px" />
		</button>
		<slot name="header" />
	</div>
	<div
		role="definition"
		class="wrapper"
		class:expanded
		style={`${maxHeightStyle(maxHeight)}${overflyYStyle(maxHeight)}`}
	>
		<div
			{id}
			aria-labelledby={nonNullish(id) ? `heading${id}` : undefined}
			class="content"
			class:wrapHeight
			bind:this={container}
		>
			<slot />
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

		gap: var(--padding);

		outline: none;

		color: var(--placeholder-color);
		font-size: var(--font-size-small);

		@include interaction.tappable;
		user-select: none;

		&:focus {
			filter: contrast(1.25);
		}
	}

	button {
		transform: rotate(90deg);

		border-color: transparent;
		background-color: transparent;

		:global(svg) {
			transition: transform var(--animation-time);
		}

		&.expanded {
			:global(svg) {
				transform: rotate(180deg);
			}
		}
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
</style>
