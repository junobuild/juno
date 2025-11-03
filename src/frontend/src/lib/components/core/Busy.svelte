<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { stopPropagation } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import IconClose from '$lib/components/icons/IconClose.svelte';
	import Message from '$lib/components/ui/Message.svelte';
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
			<Message>
				{#snippet icon()}
					{#if $busy.spinner}
						<Spinner inline />
					{/if}
				{/snippet}

				{#if $busy.close}
					<button class="text close" aria-label={$i18n.core.close} onclick={stopPropagation(close)}
						><IconClose size="18px" /> {$i18n.core.cancel}</button
					>
				{/if}
			</Message>
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
		transform: translate(-50%, calc(-50% - var(--padding-3x)));

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		color: var(--label-color);

		background: transparent;
	}

	@include media.dark-theme {
		.content {
			color: var(--value-color);
		}
	}

	button.close {
		text-decoration: none;
	}
</style>
