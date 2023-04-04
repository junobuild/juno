<script lang="ts">
	import { fade } from 'svelte/transition';
	import { i18n } from '$lib/stores/i18n.store';
	import { busy } from '$lib/stores/busy.store';
	import IconClose from '$lib/components/icons/IconClose.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { isNullish, nonNullish } from '$lib/utils/utils';

	const close = () => {
		if (isNullish($busy) || !$busy.close) {
			return;
		}

		busy.stop();
	};
</script>

{#if nonNullish($busy)}
	<div transition:fade on:click={close} class:close={$busy.close}>
		<div class="content">
			{#if $busy.spinner}
				<div class="spinner">
					<Spinner />
				</div>
			{/if}

			{#if $busy.close}
				<button on:click|stopPropagation={close} aria-label={$i18n.core.close} class="text close"
					>{$i18n.core.close} <IconClose size="14px" /></button
				>
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/interaction';
	@use '../../styles/mixins/overlay';
	@use '../../styles/mixins/display';

	div {
		z-index: calc(var(--z-index) + 1000);

		position: fixed;
		@include display.inset;

		@include overlay.backdrop(dark);

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
	}

	.close {
		align-self: flex-end;
	}

	.text {
		font-size: var(--font-size-very-small);
		text-decoration: none;
		margin-top: var(--padding);
		gap: var(--padding-0_5x);
	}
</style>
