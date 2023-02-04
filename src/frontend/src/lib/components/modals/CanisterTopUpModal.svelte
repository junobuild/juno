<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { topUp } from '$lib/api/mission-control.api';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import { toasts } from '$lib/stores/toasts.store';
	import { icpXdrConversionRate } from '$lib/api/cmc.api';
	import { createEventDispatcher, onMount } from 'svelte';
	import { formatTCycles, icpToCycles } from '$lib/utils/cycles.utils';
	import { E8S_PER_ICP, IC_TRANSACTION_FEE_ICP } from '$lib/constants/constants';
	import Input from '$lib/components/ui/Input.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import type { Principal } from '@dfinity/principal';
	import { i18n } from '$lib/stores/i18n.store';

	export let canisterId: Principal;

	let steps: 'init' | 'in_progress' | 'ready' | 'error' = 'init';

	let trillionRatio: bigint | undefined;
	onMount(async () => (trillionRatio = await icpXdrConversionRate()));

	let icp: number | undefined = undefined;

	let validIcp = false;
	$: validIcp = nonNullish(icp) && icp > 0;

	let cycles: number | undefined;
	$: cycles =
		nonNullish(trillionRatio) && validIcp
			? icpToCycles({ icp: icp as number, trillionRatio })
			: undefined;

	let validCycles = false;
	$: validCycles = nonNullish(cycles) && cycles > 2 * Number(IC_TRANSACTION_FEE_ICP);

	const onSubmit = async () => {
		if (isNullish($missionControlStore)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		if (isNullish(icp) || !validIcp || !validCycles) {
			toasts.error({
				text: `Invalid amount to top-up.`
			});
			return;
		}

		steps = 'in_progress';

		try {
			await topUp({
				canisterId,
				missionControlId: $missionControlStore,
				e8s: BigInt(icp * Number(E8S_PER_ICP))
			});

			steps = 'ready';
		} catch (err: unknown) {
			toasts.error({
				text: `Error while topping up the satellite.`,
				detail: err
			});

			steps = 'error';
		}
	};

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');
</script>

<Modal on:junoClose>
	{#if steps === 'ready'}
		<div class="msg">
			<slot name="outro" />
			<button on:click={close}>Close</button>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>Top-up in progress...</p>
		</SpinnerModal>
	{:else}
		<slot name="intro" />

		<form on:submit|preventDefault={onSubmit}>
			<Input name="icp" inputType="icp" required bind:value={icp} placeholder="ICP" />

			<p>{nonNullish(cycles) ? `${formatTCycles(BigInt(cycles))} TCycles` : ''}</p>

			<button type="submit" disabled={isNullish($missionControlStore) || !validIcp || !validCycles}
				>{$i18n.canisters.top_up}</button
			>
		</form>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	p {
		min-height: 24px;
	}

	.msg {
		@include overlay.message;
	}
</style>
