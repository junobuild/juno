<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { stopPropagation } from 'svelte/legacy';
	import { fade, scale } from 'svelte/transition';
	import IconClose from '$lib/components/icons/IconClose.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { handleKeyPress } from '$lib/utils/keyboard.utils';

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

	let bottom: number = $state(0);
	let left: number = $state(0);
	let right: number = $state(0);
	let innerWidth = $state(0);

	let attached = $state(false);

	const initPosition = () =>
		({ bottom, left, right } = nonNullish(anchor)
			? anchor.getBoundingClientRect()
			: { bottom: 0, left: 0, right: 0 });

	let position = $derived<'top' | 'bottom'>(
		bottom > window.innerHeight - 100 && !center ? 'bottom' : 'top'
	);

	$effect(() => {
		if (visible === false) {
			attached = false;
			return;
		}

		initPosition();

		attached = true;
	});

	const close = () => (visible = false);
</script>

<svelte:window onresize={initPosition} bind:innerWidth />

{#if visible && attached}
	<div
		style={`--popover-top: ${bottom}px; ${
			direction === 'rtl'
				? `--popover-right: ${innerWidth - (right ?? 0)}px;`
				: `--popover-left: ${left}px;`
		}`}
		class={`popover ${backdrop}`}
		class:center
		aria-orientation="vertical"
		role="menu"
		tabindex="-1"
		out:fade
	>
		<div
			class="backdrop"
			onclick={stopPropagation(close)}
			onkeypress={($event) => handleKeyPress({ $event, callback: close })}
			role="button"
			tabindex="-1"
		></div>
		<div
			class={`wrapper ${position}`}
			class:center
			class:rtl={direction === 'rtl'}
			transition:scale={{ delay: 25, duration: 150, easing: quintOut }}
		>
			{#if closeButton}
				<button class="close icon" aria-label={$i18n.core.close} onclick={stopPropagation(close)}
					><IconClose /></button
				>
			{/if}

			<div class="popover-content">
				{@render children()}
			</div>
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
			--popover-min-size: 540px;
		}
	}
</style>
