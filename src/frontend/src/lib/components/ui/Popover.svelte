<script lang="ts">
	import { run, createBubbler, stopPropagation } from 'svelte/legacy';

	const bubble = createBubbler();
	import { quintOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';
	import IconClose from '$lib/components/icons/IconClose.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { handleKeyPress } from '$lib/utils/keyboard.utils';
	import type { Snippet } from 'svelte';

	interface Props {
		anchor?: HTMLElement | undefined;
		visible?: boolean;
		direction?: 'ltr' | 'rtl';
		center?: boolean;
		closeButton?: boolean;
		backdrop?: 'light' | 'dark';
		children: Snippet;
	}

	let {
		anchor = undefined,
		visible = $bindable(false),
		direction = 'ltr',
		center = false,
		closeButton = false,
		backdrop = 'light',
		children
	}: Props = $props();

	let bottom: number | undefined = $state();
	let left: number | undefined = $state();
	let right: number | undefined = $state();
	let innerWidth = $state(0);

	const initPosition = () =>
		({ bottom, left, right } = anchor
			? anchor.getBoundingClientRect()
			: { bottom: 0, left: 0, right: 0 });

	run(() => {
		anchor, initPosition();
	});

	const close = () => (visible = false);
</script>

<svelte:window onresize={initPosition} bind:innerWidth />

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
		onintroend={bubble('introend')}
	>
		<div
			class="backdrop"
			onclick={stopPropagation(close)}
			onkeypress={($event) => handleKeyPress({ $event, callback: close })}
			role="button"
			tabindex="-1"
		></div>
		<div
			transition:scale={{ delay: 25, duration: 150, easing: quintOut }}
			class="wrapper"
			class:center
			class:rtl={direction === 'rtl'}
		>
			{#if closeButton}
				<button onclick={stopPropagation(close)} aria-label={$i18n.core.close} class="close icon"
					><IconClose /></button
				>
			{/if}

			{@render children()}
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
