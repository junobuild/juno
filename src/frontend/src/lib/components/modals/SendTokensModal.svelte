<script lang="ts">
	import { nonNullish, type TokenAmountV2 } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import ProgressSendTokens from '$lib/components/tokens/ProgressSendTokens.svelte';
	import SendTokensForm from '$lib/components/tokens/SendTokensForm.svelte';
	import SendTokensReview from '$lib/components/tokens/SendTokensReview.svelte';
	import Confetti from '$lib/components/ui/Confetti.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { balance } from '$lib/derived/balance.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { sendTokens } from '$lib/services/tokens.services';
	import { authStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SendTokensProgress } from '$lib/types/progress-send-tokens';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	let destination = $state('');

	let step: 'form' | 'review' | 'in_progress' | 'ready' | 'error' = $state('form');

	let amount: string | undefined = $state();

	let progress: SendTokensProgress | undefined = $state(undefined);
	const onProgress = (sendProgress: SendTokensProgress | undefined) => (progress = sendProgress);

	const onsubmit = async ({
		$event,
		token
	}: {
		$event: SubmitEvent;
		token: TokenAmountV2 | undefined;
	}) => {
		$event.preventDefault();

		onProgress(undefined);

		wizardBusy.start();
		step = 'in_progress';

		const { success } = await sendTokens({
			missionControlId: $missionControlIdDerived,
			identity: $authStore.identity,
			destination,
			token,
			onProgress
		});

		wizardBusy.stop();

		if (success !== 'ok') {
			step = 'form';
			return;
		}

		step = 'ready';
	};
</script>

{#if nonNullish($missionControlIdDerived)}
	<Modal {onclose}>
		{#if step === 'ready'}
			<Confetti />

			<div class="msg" in:fade>
				<p>{$i18n.wallet.icp_on_its_way}</p>
				<button onclick={onclose}>{$i18n.core.close}</button>
			</div>
		{:else if step === 'in_progress'}
			<ProgressSendTokens {progress} />
		{:else if step === 'review'}
			<div in:fade>
				<SendTokensReview
					missionControlId={$missionControlIdDerived}
					balance={$balance}
					bind:amount
					bind:destination
					{onsubmit}
					onback={() => (step = 'form')}
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
