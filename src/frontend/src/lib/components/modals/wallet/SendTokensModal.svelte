<script lang="ts">
	import { nonNullish, type TokenAmountV2 } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import Confetti from '$lib/components/ui/Confetti.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import ProgressSendTokens from '$lib/components/wallet/tokens/ProgressSendTokens.svelte';
	import SendTokensForm from '$lib/components/wallet/tokens/SendTokensForm.svelte';
	import SendTokensReview from '$lib/components/wallet/tokens/SendTokensReview.svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { devCyclesBalance, missionControlIcpBalance } from '$lib/derived/wallet/balance.derived';
	import { sendTokens } from '$lib/services/wallet/wallet.send.services';
	import { wizardBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { authStore } from '$lib/stores/auth.store';
	import type { JunoModalDetail, JunoModalWalletDetail } from '$lib/types/modal';
	import type { SendTokensProgress } from '$lib/types/progress-send-tokens';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { onclose, detail }: Props = $props();

	let { selectedWallet } = $derived(detail as JunoModalWalletDetail);

	let balance = $derived(
		selectedWallet.type === 'mission_control' ? $missionControlIcpBalance : $devCyclesBalance
	);

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
			selectedWallet,
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

{#if nonNullish($missionControlId)}
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
					{balance}
					onback={() => (step = 'form')}
					{onsubmit}
					{selectedWallet}
					bind:amount
					bind:destination
				/>
			</div>
		{:else}
			<SendTokensForm
				{balance}
				onreview={() => (step = 'review')}
				{selectedWallet}
				bind:amount
				bind:destination
			/>
		{/if}
	</Modal>
{/if}

<style lang="scss">
	@use '../../../styles/mixins/overlay';

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
