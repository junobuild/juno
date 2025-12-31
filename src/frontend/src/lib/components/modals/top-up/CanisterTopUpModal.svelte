<script lang="ts">
	import { Principal } from '@icp-sdk/core/principal';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import ProgressTopUp from '$lib/components/canister/ProgressTopUp.svelte';
	import CanisterTopUpForm from '$lib/components/canister/top-up/CanisterTopUpForm.svelte';
	import CanisterTopUpReview from '$lib/components/canister/top-up/CanisterTopUpReview.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { CYCLES } from '$lib/constants/token.constants';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { topUp } from '$lib/services/top-up/top-up.services';
	import { wizardBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { authStore } from '$lib/stores/auth.store';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import type { TopUpProgress } from '$lib/types/progress-topup';

	interface Props {
		outro?: Snippet;
		intro?: Snippet;
		segment: CanisterSegmentWithLabel;
		onclose: () => void;
	}

	let { outro, intro, segment, onclose }: Props = $props();

	let step: 'init' | 'review' | 'in_progress' | 'ready' | 'error' = $state('init');

	let amount = $state<string | undefined>(undefined);
	let displayTCycles = $state<string | undefined>(undefined);

	let progress = $state<TopUpProgress | undefined>(undefined);
	const onProgress = (topUpProgress: TopUpProgress | undefined) => (progress = topUpProgress);

	const onsubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		onProgress(undefined);

		wizardBusy.start();
		step = 'in_progress';

		const { success } = await topUp({
			canisterId: Principal.fromText(segment.canisterId),
			selectedWallet,
			selectedToken,
			identity: $authStore.identity,
			balance,
			amount,
			onProgress
		});

		wizardBusy.stop();

		if (success !== 'ok') {
			step = 'init';
			return;
		}

		step = 'ready';
	};

	let selectedWallet = $state<SelectedWallet | undefined>(undefined);
	let selectedToken = $state<SelectedToken>(CYCLES);
	let balance = $state<bigint>(0n);
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<div class="msg">
			{@render outro?.()}
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<ProgressTopUp {progress} />
	{:else if step === 'review'}
		<div in:fade>
			<CanisterTopUpReview
				{amount}
				{balance}
				{displayTCycles}
				onback={() => (step = 'init')}
				{onsubmit}
				{segment}
				{selectedToken}
				{selectedWallet}
			/>
		</div>
	{:else}
		<CanisterTopUpForm
			{intro}
			onreview={() => (step = 'review')}
			{segment}
			bind:selectedWallet
			bind:selectedToken
			bind:balance
			bind:amount
			bind:displayTCycles
		/>
	{/if}
</Modal>

<style lang="scss">
	@use '../../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}

	button {
		margin-top: var(--padding-2x);
	}
</style>
