<script lang="ts">
	import IconClose from '$lib/components/icons/IconClose.svelte';
	import IconMenu from '$lib/components/icons/IconMenu.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutMenuOpen } from '$lib/stores/layout-menu.store';
</script>

<div class="menu">
	<ButtonIcon onclick={() => layoutMenuOpen.set(!$layoutMenuOpen)}>
		{#snippet icon()}
			{#if $layoutMenuOpen}
				<IconClose size="16px" />
			{:else}
				<IconMenu size="16px" />
			{/if}
		{/snippet}

		{$layoutMenuOpen ? $i18n.core.close : $i18n.core.menu}
	</ButtonIcon>
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	.menu {
		padding: 0;

		// On large screen the menu is sticky therefore it cannot be opened or closed
		@include media.min-width(xlarge) {
			display: none;
		}
	}
</style>
