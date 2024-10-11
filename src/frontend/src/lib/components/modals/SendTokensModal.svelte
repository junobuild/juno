<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalSendTokensDetail } from '$lib/types/modal';
	import SendTokensForm from '$lib/components/tokens/SendTokensForm.svelte';
	import SendTokensReview from '$lib/components/tokens/SendTokensReview.svelte';
	import Confetti from '$lib/components/ui/Confetti.svelte';
	import { fade } from 'svelte/transition';

	export let detail: JunoModalDetail;

	let balance: bigint | undefined;
	$: ({ balance } = detail as JunoModalSendTokensDetail);

	let steps: 'form' | 'review' | 'in_progress' | 'ready' | 'error';

	let destination = '';
	let amount: string | undefined;
</script>

<svelte:window on:junoSyncBalance={({ detail: syncBalance }) => (balance = syncBalance)} />

{#if nonNullish($missionControlStore)}
	<Modal on:junoClose>
		{#if steps === 'ready'}
			<Confetti />

			<div class="msg" in:fade>
				<p>{$i18n.wallet.icp_on_its_way}</p>
				<button on:click={close}>{$i18n.core.close}</button>
			</div>
		{:else if steps === 'in_progress'}
			<SpinnerModal>
				<p>{$i18n.wallet.sending_in_progress}</p>
			</SpinnerModal>
		{:else if steps === 'review'}
			<div in:fade>
				<SendTokensReview
						missionControlId={$missionControlStore}
						{balance}
						bind:amount
						bind:destination
						on:junoNext={({ detail }) => (steps = detail)}
				/>
			</div>
		{:else}
			<SendTokensForm
				{balance}
				bind:amount
				bind:destination
				on:junoReview={() => (steps = 'review')}
			/>
		{/if}
	</Modal>
{/if}

<style lang="scss">
	@use '../../styles/mixins/overlay';

	h2 {
		@include overlay.title;
	}

	.msg {
		@include overlay.message;

		p {
			margin: var(--padding-8x) 0 0;
		}
	}

	form {
		display: flex;
		flex-direction: column;
	}

	button {
		margin-top: var(--padding-2x);
	}
</style>