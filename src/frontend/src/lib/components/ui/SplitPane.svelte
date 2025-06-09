<script lang="ts">
	import type { Snippet } from 'svelte';
	import { run } from 'svelte/legacy';
	import { layoutMenuOpen } from '$lib/stores/layout-menu.store';

	interface Props {
		menu?: Snippet;
		children: Snippet;
	}

	let { menu, children }: Props = $props();

	let innerWidth = $state(0);

	// Close menu if it was opened and the viewport width becomes larger than xlarge screen (where the menu becomes sticky)
	const onWindowSizeChange = (innerWidth: number) => {
		if (!$layoutMenuOpen) {
			return;
		}

		// The media query breakpoint to stick the menu is media xlarge 1300px
		layoutMenuOpen.set(innerWidth > 1300 ? false : $layoutMenuOpen);
	};

	run(() => {
		onWindowSizeChange(innerWidth);
	});
</script>

<svelte:window bind:innerWidth />

<div class="split-pane">
	{@render menu?.()}
	{@render children()}
</div>

<style lang="scss">
	@use '../../styles/mixins/display';

	.split-pane {
		position: absolute;
		@include display.inset;

		display: flex;
		flex-flow: row nowrap;

		overflow: hidden;
	}
</style>
