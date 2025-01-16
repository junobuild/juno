<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import SendTokensForm from '$lib/components/tokens/SendTokensForm.svelte';
	import SendTokensReview from '$lib/components/tokens/SendTokensReview.svelte';
	import Confetti from '$lib/components/ui/Confetti.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail } from '$lib/types/modal';
	import { balance } from '$lib/derived/balance.derived';

	let destination = $state('');

	let step: 'form' | 'review' | 'in_progress' | 'ready' | 'error' = $state('form');

	let amount: string | undefined = $state();

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');
</script>

{#if nonNullish($missionControlIdDerived)}
	<Modal on:junoClose>
		{#if step === 'ready'}
			<Confetti />

			<div class="msg" in:fade>
				<p>{$i18n.wallet.icp_on_its_way}</p>
				<button onclick={close}>{$i18n.core.close}</button>
			</div>
		{:else if step === 'in_progress'}
			<SpinnerModal>
				<p>{$i18n.wallet.sending_in_progress}</p>
			</SpinnerModal>
		{:else if step === 'review'}
			<div in:fade>
				<SendTokensReview
					missionControlId={$missionControlIdDerived}
					balance={$balance}
					bind:amount
					bind:destination
					onnext={(nextSteps) => (step = nextSteps)}
				/>
			</div>
		{:else}
			<SendTokensForm
				balance={$balance}
				bind:amount
				bind:destination
				onreview={() => (step = 'review')}
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

	button {
		margin-top: var(--padding-2x);
	}
</style>
