<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { i18n } from '$lib/stores/i18n.store';
	import IconClose from '$lib/components/icons/IconClose.svelte';
	import { createEventDispatcher } from 'svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import { handleKeyPress } from '$lib/utils/keyboard.utils';

	let visible = true;

	const dispatch = createEventDispatcher();

	const close = () => {
		if ($isBusy) {
			return;
		}

		visible = false;
		dispatch('junoClose');
	};

	const stickyFooter: boolean = $$slots.stickyFooter !== undefined;
	const footer: boolean = ($$slots.footer ?? false) || stickyFooter;
</script>

{#if visible}
	<div
		class="modal"
		transition:fade
		role="dialog"
		aria-labelledby="modalTitle"
		aria-describedby="modalContent"
		on:introend
	>
		<div
			class="backdrop"
			on:click|stopPropagation={close}
			on:keypress={($event) => handleKeyPress({ $event, callback: close })}
			role="button"
			tabindex="-1"
		/>
		<div
			transition:scale={{ delay: 25, duration: 150, easing: quintOut }}
			class="wrapper"
			class:flex={!stickyFooter}
		>
			<div class="toolbar">
				<h3 id="modalTitle"><slot name="title" /></h3>
				<button on:click|stopPropagation={close} aria-label={$i18n.core.close} disabled={$isBusy}
					><IconClose /></button
				>
			</div>

			<div class="content" id="modalContent">
				<slot />
			</div>

			{#if footer}
				<footer class:sticky={stickyFooter}>
					<slot name="footer" />
					<slot name="stickyFooter" />
				</footer>
			{/if}
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

		padding: var(--modal-content-padding, 0 2.45rem);

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

	.sticky {
		position: absolute;
		top: auto;
		bottom: 0;
		left: 0;
		right: 0;
	}
</style>
