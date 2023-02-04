<script lang="ts">
	import { fade } from 'svelte/transition';
	import { i18n } from '$lib/stores/i18n.store';
	import { busy } from '$lib/stores/busy.store';
	import IconClose from '$lib/components/icons/IconClose.svelte';
	import Version from '$lib/components/ui/Version.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	let visible: boolean;
	$: visible = $busy !== undefined;

	const close = () => busy.stop();
</script>

{#if visible}
	<div transition:fade>
		{#if $busy.close}
			<div class="backdrop" on:click={close} />
		{/if}

		<div class="content">
			{#if $busy.close}
				<button on:click|stopPropagation={close} aria-label={$i18n.core.close} class="text close"
					><IconClose /></button
				>
			{/if}

			{#if $busy.log && !$busy.spinner}
				<Version />
			{/if}

			{#if $busy.spinner}
				<div class="spinner">
					<Spinner />
				</div>
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
	}

	.backdrop {
		position: absolute;
		@include display.inset;

		background: transparent;

		@include interaction.tappable;
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
		color: var(--color-card);
	}
</style>
