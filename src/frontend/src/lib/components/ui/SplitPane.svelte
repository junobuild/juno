<script lang="ts">
	import { layoutMenuOpen } from '$lib/stores/layout.store';

	let innerWidth = 0;

	// Close menu if it was opened and the viewport width becomes larger than xlarge screen (where the menu becomes sticky)
	const onWindowSizeChange = (innerWidth: number) => {
		if (!$layoutMenuOpen) {
			return;
		}

		// The media query breakpoint to stick the menu is media xlarge 1300px
		layoutMenuOpen.set(innerWidth > 1300 ? false : $layoutMenuOpen);
	};

	$: onWindowSizeChange(innerWidth);
</script>

<svelte:window bind:innerWidth />

<div class="split-pane">
	<slot name="menu" />
	<slot />
</div>

<style lang="scss">
	@use '../../styles/mixins/display';

	.split-pane {
		position: absolute;
		@include display.inset;

		display: flex;
		flex-flow: row nowrap;

		overflow-x: hidden;
	}
</style>
