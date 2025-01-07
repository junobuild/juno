<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { theme } from '$lib/stores/theme.store';
	import { Theme } from '$lib/types/theme';
	import Toggle from '$lib/components/ui/Toggle.svelte';

	interface Props {
		inline?: boolean;
	}

	let { inline = false }: Props = $props();

	let dark = $derived($theme === Theme.DARK);
</script>

<Toggle
	toggle={dark}
	onclick={() => theme.select(dark ? Theme.LIGHT : Theme.DARK)}
	nomargin={!inline}
>
	<span class:inline>
		{#if dark}
			{$i18n.core.light_off}
		{:else}
			{$i18n.core.light_on}
		{/if}
	</span>
</Toggle>

<style lang="scss">
	@use '../../styles/mixins/media';

	span {
		font-size: var(--font-size-ultra-small);

		&.inline {
			font-size: inherit;

			margin: 0 0 var(--padding-0_5x);
		}

		color: var(--color-primary-contrast);
		text-decoration: none;

		&:hover:not(:disabled),
		&:active:not(:disabled) {
			color: var(--color-primary-contrast);
			font-weight: var(--font-weight-bold);
		}
	}

	@include media.dark-theme {
		span {
			color: var(--color-card-contrast);

			&:hover:not(:disabled),
			&:active:not(:disabled) {
				color: var(--color-card-contrast);
			}
		}
	}
</style>
