<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { stopPropagation } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import IconClose from '$lib/components/icons/IconClose.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { handleKeyPress } from '$lib/utils/keyboard.utils';

	const close = () => {
		if (isNullish($busy) || !$busy.close) {
			return;
		}

		busy.stop();
	};
</script>

{#if nonNullish($busy)}
	<div
		class:close={$busy.close}
		aria-label={$i18n.core.close}
		onclick={close}
		onkeypress={($event) => handleKeyPress({ $event, callback: close })}
		role="button"
		tabindex="-1"
		transition:fade
	>
		<div class="content">
			{#if $busy.spinner}
				<div class="spinner">
					<Spinner />
				</div>
			{/if}

			{#if $busy.close}
				<button class="text close" aria-label={$i18n.core.close} onclick={stopPropagation(close)}
					><IconClose size="12px" /> {$i18n.core.cancel}</button
				>
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/interaction';
	@use '../../styles/mixins/overlay';
	@use '../../styles/mixins/display';
	@use '../../styles/mixins/media';

	div {
		z-index: calc(var(--z-index) + 1000);

		position: fixed;
		@include display.inset;

		@include overlay.backdrop(dark, $blur: false);

		&.close {
			@include interaction.tappable;
		}
	}

	.content {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		width: fit-content;

		background: transparent;
	}

	.spinner {
		position: relative;
		height: 30px;
		margin: 1.45rem;
		background: none;
	}

	.text {
		font-size: var(--font-size-very-small);
		color: var(--label-color);
		text-decoration: none;
		display: inline-flex;
		gap: var(--padding-0_5x);
	}

	.spinner {
		color: var(--label-color);
	}

	@include media.dark-theme {
		.text,
		.spinner {
			color: var(--value-color);
		}
	}
</style>
