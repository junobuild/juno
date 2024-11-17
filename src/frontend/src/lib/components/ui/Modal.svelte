<script lang="ts">
	import { createEventDispatcher, type Snippet } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { fade, scale } from 'svelte/transition';
	import IconClose from '$lib/components/icons/IconClose.svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { handleKeyPress } from '$lib/utils/keyboard.utils';

	interface Props {
		title?: Snippet;
		children: Snippet;
	}

	let { children, title }: Props = $props();

	let visible = $state(true);

	const dispatch = createEventDispatcher();

	const onClose = ($event: MouseEvent | TouchEvent) => {
		$event.stopPropagation();

		close();
	};

	const close = () => {
		if ($isBusy) {
			return;
		}

		visible = false;
		dispatch('junoClose');
	};
</script>

{#if visible}
	<div
		class="modal"
		transition:fade
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
				<h3 id="modalTitle">{@render title?.()}</h3>
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
	}

	.flex {
		display: flex;
		flex-direction: column;
	}

	.toolbar {
		display: grid;
		grid-template-columns: 65px 1fr 65px;
		align-items: center;

		h3 {
			grid-column-start: 2;
			text-align: center;
			margin-bottom: 0;
		}

		button {
			grid-column-start: 3;
			margin: 0.45rem;
		}
	}

	.content {
		position: relative;

		padding: var(--modal-content-padding, 0 var(--padding-2x));

		overflow: auto;
		height: calc(100% - 60px);
		max-height: calc(100% - 60px);
	}

	footer {
		display: flex;
		justify-content: center;

		padding: 0.75rem 2.25rem;

		background: rgba(var(--color-primary-rgb), 0.8);
	}
</style>
