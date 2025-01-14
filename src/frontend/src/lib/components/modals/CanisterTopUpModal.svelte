<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import { topUp } from '$lib/api/mission-control.api';
	import CanisterTopUpForm from '$lib/components/canister/CanisterTopUpForm.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { E8S_PER_ICP } from '$lib/constants/constants';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { authStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { Segment } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		canisterId: Principal;
		balance: bigint;
		accountIdentifier: AccountIdentifier | undefined;
		outro?: Snippet;
		intro?: Snippet;
		segment: Segment;
		onclose: () => void;
	}

	let { canisterId, balance, accountIdentifier, outro, intro, segment, onclose }: Props = $props();

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	let icp: number | undefined = $state(undefined);
	let invalidIcpCycles = $state(false);

	const onsubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if (isNullish($missionControlIdDerived)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		if (isNullish(icp) || invalidIcpCycles) {
			toasts.error({
				text: $i18n.errors.invalid_amount_to_top_up
			});
			return;
		}

		wizardBusy.start();
		step = 'in_progress';

		try {
			await topUp({
				canisterId,
				missionControlId: $missionControlIdDerived,
				e8s: BigInt(icp * Number(E8S_PER_ICP)),
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
	{:else}
		<CanisterTopUpForm
			{intro}
			{segment}
			{balance}
			{accountIdentifier}
			{onsubmit}
			bind:icp
			bind:invalidIcpCycles
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
