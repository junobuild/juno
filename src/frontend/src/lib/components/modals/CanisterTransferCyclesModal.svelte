<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import CanisterTransferCyclesForm from '$lib/components/canister/CanisterTransferCyclesForm.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { authSignedOut } from '$lib/derived/auth.derived';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';
	import CanisterTransferCyclesReview from '$lib/components/canister/CanisterTransferCyclesReview.svelte';

	interface Props {
		segment: CanisterSegmentWithLabel;
		currentCycles: bigint;
		transferFn: (params: { cycles: bigint; destinationId: Principal }) => Promise<void>;
		onclose: () => void;
	}

	let { segment, currentCycles, transferFn, onclose }: Props = $props();

	let step: 'init' | 'review' | 'in_progress' | 'ready' | 'error' = $state('init');

	let cycles = $state(0n);
	let destinationId: string | undefined = $state(undefined);

	const onsubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		if ($authSignedOut) {
			toasts.error({
				text: $i18n.errors.no_identity
			});
			return;
		}

		if (cycles > currentCycles) {
			toasts.error({
				text: $i18n.errors.invalid_cycles_to_transfer
			});
			return;
		}

		if (isNullish(destinationId) || destinationId === '') {
			toasts.error({
				text: $i18n.errors.invalid_cycles_destination
			});
			return;
		}

		step = 'in_progress';

		wizardBusy.start();

		try {
			await transferFn({
				cycles,
				destinationId: Principal.fromText(destinationId)
			});

			emit({
				message: 'junoRestartCycles',
				detail: { canisterId: Principal.fromText(segment.canisterId) }
			});

			step = 'ready';
		} catch (err: unknown) {
			step = 'error';

			toasts.error({
				text: $i18n.errors.transfer_cycles,
				detail: err
			});
		}

		wizardBusy.stop();
	};

	const onreview = () => (step = 'review');
</script>

<Modal on:junoClose={onclose}>
	{#if step === 'ready'}
		<div class="msg">
			<p>{$i18n.canisters.transfer_cycles_done}</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.canisters.transfer_cycles_in_progress}</p>
		</SpinnerModal>
	{:else if step === 'review'}
		<CanisterTransferCyclesReview
			{cycles}
			{destinationId}
			onback={() => (step = 'init')}
			{onsubmit}
		/>
	{:else}
		<CanisterTransferCyclesForm
			{segment}
			{currentCycles}
			{onreview}
			bind:cycles
			bind:destinationId
		/>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	button {
		margin: var(--padding-2x) 0 0;
	}

	.msg {
		@include overlay.message;

		p {
			margin: 0;
		}
	}
</style>
