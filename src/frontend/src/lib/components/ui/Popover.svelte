<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { i18n } from '$lib/stores/i18n.store';
	import IconClose from '$lib/components/icons/IconClose.svelte';

	export let anchor: HTMLElement | undefined = undefined;
	export let visible = false;
	export let direction: 'ltr' | 'rtl' = 'ltr';
	export let center = false;
	export let closeButton = false;
	export let backdrop: 'light' | 'dark' = 'light';

	let bottom: number;
	let left: number;
	let right: number;
	let innerWidth = 0;

	const initPosition = () =>
		({ bottom, left, right } = anchor
			? anchor.getBoundingClientRect()
			: { bottom: 0, left: 0, right: 0 });

	$: anchor, initPosition();

	const close = () => (visible = false);
</script>

<svelte:window on:resize={initPosition} bind:innerWidth />

{#if visible}
	<div
		role="menu"
		aria-orientation="vertical"
		transition:fade
		class={`popover ${backdrop}`}
		class:center
		tabindex="-1"
		style={`--popover-top: ${bottom}px; ${
			direction === 'rtl'
				? `--popover-right: ${innerWidth - right}px;`
				: `--popover-left: ${left}px;`
		}`}
		on:click|stopPropagation
		on:introend
	>
		<div class="backdrop" on:click|stopPropagation={() => (visible = false)} />
		<div
			transition:scale={{ delay: 25, duration: 150, easing: quintOut }}
			class="wrapper"
			class:center
			class:rtl={direction === 'rtl'}
		>
			{#if closeButton}
				<button on:click|stopPropagation={close} aria-label={$i18n.core.close} class="close icon"
					><IconClose /></button
				>
			{/if}

			<slot />
		</div>
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.popover {
		&:not(.dark) {
			@include overlay.popover;
		}

		&.dark {
			@include overlay.popover(dark);
		}

		&.center {
			--popover-min-size: 340px;
		}
	}
</style>
