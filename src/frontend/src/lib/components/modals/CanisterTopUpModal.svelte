<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { Principal } from '@dfinity/principal';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import CanisterTopUpForm from '$lib/components/canister/CanisterTopUpForm.svelte';
	import CanisterTopUpReview from '$lib/components/canister/CanisterTopUpReview.svelte';
	import ProgressTopUp from '$lib/components/canister/ProgressTopUp.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { topUp } from '$lib/services/topup.services';
	import { authStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import type { TopUpProgress } from '$lib/types/progress-topup';

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

	let progress: TopUpProgress | undefined = $state(undefined);
	const onProgress = (topUpProgress: TopUpProgress | undefined) => (progress = topUpProgress);

	const onsubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		onProgress(undefined);

		wizardBusy.start();
		step = 'in_progress';

		const { success } = await topUp({
			canisterId: Principal.fromText(segment.canisterId),
			missionControlId: $missionControlIdDerived,
			identity: $authStore.identity,
			cycles,
			balance,
			icp,
			onProgress
		});

		wizardBusy.stop();

		if (success !== 'ok') {
			step = 'init';
			return;
		}

		step = 'ready';
	};
</script>

<Modal on:junoClose={onclose}>
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
