<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { topUp } from '$lib/api/mission-control.api';
	import CanisterTopUpForm from '$lib/components/canister/CanisterTopUpForm.svelte';
	import CanisterTopUpReview from '$lib/components/canister/CanisterTopUpReview.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { TOP_UP_NETWORK_FEES } from '$lib/constants/constants';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { authStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';
	import { assertAndConvertAmountToICPToken } from '$lib/utils/token.utils';

	interface Props {
		balance: bigint;
		accountIdentifier: AccountIdentifier | undefined;
		outro?: Snippet;
		intro?: Snippet;
		segment: CanisterSegmentWithLabel;
		onclose: () => void;
	}

	let { balance, accountIdentifier, outro, intro, segment, onclose }: Props = $props();

	let step: 'init' | 'review' | 'in_progress' | 'ready' | 'error' = $state('init');

	let icp: string | undefined = $state(undefined);
	let cycles: number | undefined = $state(undefined);

	const onsubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (isNullish($missionControlIdDerived)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		if (isNullish(cycles)) {
			toasts.error({
				text: $i18n.errors.invalid_amount_to_top_up
			});
			return;
		}

		const { valid, tokenAmount } = assertAndConvertAmountToICPToken({
			balance,
			amount: icp,
			fee: TOP_UP_NETWORK_FEES
		});

		if (!valid || isNullish(tokenAmount)) {
			return;
		}

		wizardBusy.start();
		step = 'in_progress';

		try {
			const canisterId = Principal.fromText(segment.canisterId);

			await topUp({
				canisterId,
				missionControlId: $missionControlIdDerived,
				e8s: tokenAmount.toE8s(),
				identity: $authStore.identity
			});

			emit({ message: 'junoRestartCycles', detail: { canisterId } });

			step = 'ready';
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.top_up_error,
				detail: err
			});

			step = 'error';
		}

		wizardBusy.stop();
	};
</script>

<Modal on:junoClose={onclose}>
	{#if step === 'ready'}
		<div class="msg">
			{@render outro?.()}
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.canisters.top_up_in_progress}</p>
		</SpinnerModal>
	{:else if step === 'review'}
		<div in:fade>
			<CanisterTopUpReview
				{balance}
				{icp}
				{cycles}
				{segment}
				{onsubmit}
				onback={() => (step = 'init')}
			/>
		</div>
	{:else}
		<CanisterTopUpForm
			{intro}
			{segment}
			{balance}
			{accountIdentifier}
			{onclose}
			onreview={() => (step = 'review')}
			bind:icp
			bind:cycles
		/>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}

	button {
		margin-top: var(--padding-2x);
	}
</style>
