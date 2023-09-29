<script lang="ts">
	import { theme } from '$lib/stores/theme.store';
	import { Theme } from '$lib/types/theme';
	import IconLightOff from '$lib/components/icons/IconLightOff.svelte';
	import IconLightOn from '$lib/components/icons/IconLightOn.svelte';
	import type {ComponentType} from 'svelte';
	import { i18n } from '$lib/stores/i18n.store';

	let dark: boolean;
	$: dark = $theme === Theme.DARK;

	let icon: ComponentType;
	$: icon = dark ? IconLightOn : IconLightOff;
</script>

<button class="text" on:click={() => theme.select(dark ? Theme.LIGHT : Theme.DARK)}>
	<svelte:component this={icon} />
	<span>
		{#if dark}
			{$i18n.core.light_on}
		{:else}
			{$i18n.core.light_off}
		{/if}
	</span>
</button>

<style lang="scss">
	@use '../../styles/mixins/media';

	.text {
		display: inline-flex;
		justify-content: flex-start;
		gap: var(--padding);

		min-width: var(--menu-width);

		text-decoration: none;

		margin: var(--padding) 0;

		&:active {
			transform: none;
		}
	}

	span {
		font-size: var(--font-size-ultra-small);
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
