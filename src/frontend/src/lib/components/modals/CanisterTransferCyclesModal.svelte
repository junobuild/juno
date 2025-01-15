<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { createEventDispatcher } from 'svelte';
	import { run, preventDefault } from 'svelte/legacy';
	import CanistersPicker from '$lib/components/canister/CanistersPicker.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authSignedOut } from '$lib/derived/auth.derived';
	import { isBusy, wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { formatTCycles, tCyclesToCycles } from '$lib/utils/cycles.utils';
	import { emit } from '$lib/utils/events.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import GridArrow from "$lib/components/ui/GridArrow.svelte";

	interface Props {
		canisterId: Principal;
		segment: 'satellite' | 'analytics' | 'mission_control';
		currentCycles: bigint;
		transferFn: (params: { cycles: bigint; destinationId: Principal }) => Promise<void>;
	}

	let { canisterId, segment, currentCycles, transferFn }: Props = $props();

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');

	let tCycles: string = $state('');

	let cycles: bigint = $derived(tCyclesToCycles(tCycles));

	let destinationId: string | undefined = $state();

	let validConfirm = $state(false);
	run(() => {
		validConfirm =
			cycles > 0 && cycles <= currentCycles && nonNullish(destinationId) && destinationId !== '';
	});

	let remainingCycles: bigint = $derived(currentCycles - cycles > 0 ? currentCycles - cycles : 0n);

	const onSubmit = async () => {
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

			emit({ message: 'junoRestartCycles', detail: { canisterId } });

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
</script>

<Modal on:junoClose>
	{#if step === 'ready'}
		<div class="msg">
			<p>{$i18n.canisters.transfer_cycles_done}</p>
			<button onclick={close}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.canisters.transfer_cycles_in_progress}</p>
		</SpinnerModal>
	{:else}
		<form onsubmit={preventDefault(onSubmit)}>
			<h2>
				{$i18n.canisters.transfer_cycles}
			</h2>

			<p>
				{$i18n.canisters.transfer_cycles_description}
				<Html
					text={i18nFormat($i18n.canisters.your_balance, [
						{
							placeholder: '{0}',
							value: segment.replace('_', ' ')
						},
						{
							placeholder: '{1}',
							value: formatTCycles(currentCycles)
						}
					])}
				/>
			</p>

			<div class="columns">
				<div>
					<Value ref="cycles">
						{#snippet label()}
							T Cycles
						{/snippet}

						<Input
							name="cycles"
							inputType="icp"
							required
							bind:value={tCycles}
							placeholder={$i18n.canisters.amount_cycles}
						>
							{#snippet footer()}
								<span class="remaining-cycles">
									<small
										><Html
											text={i18nFormat($i18n.canisters.cycles_will_remain, [
												{
													placeholder: '{0}',
													value: formatTCycles(remainingCycles)
												},
												{
													placeholder: '{1}',
													value: segment.replace('_', ' ')
												}
											])}
										/></small
									>
								</span>
							{/snippet}
						</Input>
					</Value>
				</div>

				<GridArrow small />

				<div>
					<Value>
						{#snippet label()}
							{$i18n.canisters.destination}
						{/snippet}

						<CanistersPicker excludeSegmentId={canisterId} bind:segmentIdText={destinationId} />
					</Value>
				</div>
			</div>

			<button type="submit" class="submit" disabled={$isBusy || !validConfirm}>
				{$i18n.core.submit}
			</button>
		</form>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/grid';

	.columns {
		@include media.min-width(large) {
			@include grid.two-columns-with-arrow;
		}
	}

	button {
		margin: var(--padding-2x) 0 0;
	}

	.msg {
		@include overlay.message;

		p {
			margin: 0;
		}
	}

	.remaining-cycles {
		display: block;
		padding: var(--padding-0_5x) 0 0;
	}
</style>
