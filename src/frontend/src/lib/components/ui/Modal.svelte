<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';
	import IconBack from '$lib/components/icons/IconBack.svelte';
	import IconClose from '$lib/components/icons/IconClose.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { handleKeyPress } from '$lib/utils/keyboard.utils';

	interface Props {
		onback?: () => void;
		children: Snippet;
		onclose: () => void;
	}

	let { children, onback, onclose }: Props = $props();

	let visible = $state(true);

	const onClose = ($event: MouseEvent | TouchEvent) => {
		$event.stopPropagation();

		close();
	};

	const close = () => {
		if ($isBusy) {
			return;
		}

		visible = false;
		onclose();
	};
</script>

{#if visible}
	<div
		class="modal"
		out:fade
		role="dialog"
		aria-labelledby="modalTitle"
		aria-describedby="modalContent"
	>
		<div
			class="backdrop"
			onclick={onClose}
			onkeypress={($event) => handleKeyPress({ $event, callback: close })}
			role="button"
			tabindex="-1"
		></div>
		<div transition:scale={{ delay: 25, duration: 150, easing: quintOut }} class="wrapper flex">
			<div class="toolbar">
				{#if nonNullish(onback)}
					<div class="start">
						<ButtonIcon onclick={onback} disabled={$isBusy}>
							{#snippet icon()}
								<IconBack size="16px" />
							{/snippet}
							{$i18n.core.back}
						</ButtonIcon>
					</div>
				{/if}

				<button onclick={onClose} aria-label={$i18n.core.close} disabled={$isBusy}
					><IconClose /></button
				>
			</div>

			<div class="content" id="modalContent">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/interaction';
	@use '../../styles/mixins/section';
	@use '../../styles/mixins/overlay';
	@use '../../styles/mixins/shadow';
	@use '../../styles/mixins/display';

	.modal {
		position: fixed;
		z-index: calc(var(--z-index) + 998);
		@include display.inset;
	}

	.backdrop {
		position: absolute;
		@include display.inset;

		@include overlay.backdrop(dark);

		@include interaction.tappable;
	}

	.wrapper {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		overflow: hidden;
		height: calc(min(100vh, 796px) - 2.75rem);

		@include section.large;

		@include shadow.strong-card;

		@supports (-webkit-touch-callout: none) {
			& {
				max-height: -webkit-fill-available;
			}
		}

		@supports (-webkit-touch-callout: none) and (height: 100dvh) {
			& {
				height: calc(100dvh - 2.75rem);
			}
		}
	}

	.flex {
		display: flex;
		flex-direction: column;
	}

	.toolbar {
		display: grid;
		grid-template-columns: auto 1fr 65px;
		align-items: center;

		.start {
			margin: 0 var(--padding-2x);
		}

		button {
			grid-column-start: 3;
			margin: var(--padding);
		}
	}

	.content {
		position: relative;

		padding: var(--padding) var(--padding-3x);

		overflow: auto;
		height: calc(100% - 60px);
		max-height: calc(100% - 60px);
	}
</style>
