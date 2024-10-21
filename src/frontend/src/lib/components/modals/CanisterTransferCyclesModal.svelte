<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { createEventDispatcher } from 'svelte';
	import CanistersPicker from '$lib/components/canister/CanistersPicker.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { ONE_TRILLION } from '$lib/constants/constants';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { isBusy, wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { emit } from '$lib/utils/events.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import Html from '$lib/components/ui/Html.svelte';

	export let canisterId: Principal;
	export let segment: 'satellite' | 'analytics' | 'mission_control';
	export let currentCycles: bigint;
	export let transferFn: (params: { cycles: bigint; destinationId: Principal }) => Promise<void>;

	let steps: 'init' | 'in_progress' | 'ready' | 'error' = 'init';

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');

	let tCycles: string;

	let cycles: bigint;
	$: (() => {
		cycles = BigInt(parseFloat(tCycles ?? 0) * ONE_TRILLION);
	})();

	let destinationId: string | undefined;

	let validConfirm = false;
	$: validConfirm =
		cycles > 0 && cycles <= currentCycles && nonNullish(destinationId) && destinationId !== '';

	let remainingCycles: bigint;
	$: remainingCycles = currentCycles - cycles > 0 ? currentCycles - cycles : 0n;

	const onSubmit = async () => {
		if (!$authSignedInStore) {
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

		steps = 'in_progress';

		wizardBusy.start();

		try {
			await transferFn({
				cycles,
				destinationId: Principal.fromText(destinationId)
			});

			emit({ message: 'junoRestartCycles', detail: { canisterId } });

			steps = 'ready';
		} catch (err: unknown) {
			steps = 'error';

			toasts.error({
				text: $i18n.errors.transfer_cycles,
				detail: err
			});
		}

		wizardBusy.stop();
	};
</script>

<Modal on:junoClose>
	{#if steps === 'ready'}
		<div class="msg">
			<p>{$i18n.canisters.transfer_cycles_done}</p>
			<button on:click={close}>{$i18n.core.close}</button>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.canisters.transfer_cycles_in_progress}</p>
		</SpinnerModal>
	{:else}
		<form on:submit|preventDefault={onSubmit}>
			<h2>
				{$i18n.canisters.transfer_cycles}
			</h2>

			<p>
				{$i18n.canisters.transfer_cycles_description}
			</p>

			<p>
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

			<Value>
				<svelte:fragment slot="label">{$i18n.canisters.destination}</svelte:fragment>

				<CanistersPicker excludeSegmentId={canisterId} bind:segmentIdText={destinationId} />
			</Value>

			<Value ref="cycles">
				<svelte:fragment slot="label">T Cycles</svelte:fragment>

				<Input
					name="cycles"
					inputType="icp"
					required
					bind:value={tCycles}
					placeholder={$i18n.canisters.amount_cycles}
				/>
			</Value>

			<p>
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
			</p>

			<button type="submit" class="submit" disabled={$isBusy || !validConfirm}>
				{$i18n.core.submit}
			</button>
		</form>
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
