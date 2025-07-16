<script lang="ts">
	import type { Snippet } from 'svelte';
	import Logo from '$lib/components/core/Logo.svelte';
	import IconBack from '$lib/components/icons/IconBack.svelte';
	import { menuCollapsed, menuExpanded } from '$lib/derived/layout-menu.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutMenuState, layoutMenuOpen } from '$lib/stores/layout-menu.store';
	import { handleKeyPress } from '$lib/utils/keyboard.utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const close = () => layoutMenuOpen.set(false);
</script>

<div role="menu">
	<div
		class="inner"
		data-tid="menu-inner"
		class:open={$layoutMenuOpen}
		onkeypress={($event) => handleKeyPress({ $event, callback: close })}
		onclick={close}
		role="button"
		tabindex="-1"
	>
		<div class="logo">
			<Logo color="white" variant={$menuExpanded ? 'text' : 'icon'} />
		</div>

		{@render children()}
	</div>

	<button
		class="menu-collapse square"
		class:collapsed={$menuExpanded}
		title={$menuCollapsed ? $i18n.core.expand : $i18n.core.collapse}
		onclick={layoutMenuState.toggle}><IconBack /></button
	>
</div>

<style lang="scss">
	@use '../../styles/mixins/interaction';
	@use '../../styles/mixins/display';
	@use '../../styles/mixins/media';

	div[role='menu'] {
		@include interaction.initial;

		box-sizing: border-box;

		z-index: var(--menu-z-index);

		position: relative;

		background: var(--color-primary);
		color: var(--color-primary-contrast);
	}

	@include media.dark-theme {
		div[role='menu'] {
			background: var(--color-menu);
			color: var(--color-menu-contrast);
		}
	}

	.inner {
		display: flex;
		flex-direction: column;
		align-items: center;

		width: 0;
		max-width: 100vw;
		height: 100%;

		overflow-y: auto;
		overflow-x: hidden;

		transition:
			margin-left var(--animation-time) var(--menu-animation-timing-function),
			width var(--animation-time) var(--menu-animation-timing-function);

		// On xlarge screen the header is not sticky but within the content that's why we align the inner menu start
		box-sizing: border-box;

		// On xlarge screen the menu can be always open
		@include media.min-width(xlarge) {
			width: var(--menu-width);
			margin-left: 0;
		}

		// On smaller screen the menu is open on demand
		&.open {
			width: var(--menu-width);
			margin-left: 0;
		}
	}

	.logo {
		padding: calc(var(--padding-4x) - 2px) 0 13vh;
		min-height: 20vh;
	}

	.menu-collapse {
		position: absolute;
		right: calc(-1 * var(--padding));
		bottom: var(--padding-8x);

		transform: rotate(180deg);

		display: none;

		@include media.min-width(xlarge) {
			display: flex;
		}

		&.collapsed {
			transform: rotate(0deg);
		}
	}
</style>
