<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutMenuOpen } from '$lib/stores/layout.store';
	import IconClose from '$lib/components/icons/IconClose.svelte';
	import IconMenu from '$lib/components/icons/IconMenu.svelte';
</script>

<button
	data-tid="menu-toggle"
	class="menu"
	on:click={() => layoutMenuOpen.set(!$layoutMenuOpen)}
	aria-label={$layoutMenuOpen ? $i18n.core.close : $i18n.core.menu}
>
	{#if $layoutMenuOpen}
		<IconClose />
	{:else}
		<IconMenu />
	{/if}
</button>

<style lang="scss">
	@use '../../styles/mixins/media';

	.menu {
		padding: 0;

		// On large screen the menu is sticky therefore it cannot be opened or closed
		@include media.min-width(xlarge) {
			display: none;
		}

		:global(svg) {
			width: 28px;
			height: 28px;
			min-width: 28px;
		}
	}
</style>
