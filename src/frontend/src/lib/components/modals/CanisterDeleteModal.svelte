<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { createEventDispatcher } from 'svelte';
	import { isBusy, wizardBusy } from '$lib/stores/busy.store';
	import Value from '$lib/components/ui/Value.svelte';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { isNullish } from '@dfinity/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { loadSatellites } from '$lib/services/satellites.services';
	import { goto } from '$app/navigation';
	import type { Principal } from '@dfinity/principal';
	import { ONE_TRILLION } from '$lib/constants/constants';
	import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';
	import { formatTCycles } from '$lib/utils/cycles.utils';

	export let segment: 'satellite' | 'analytics';
	export let currentCycles: bigint;
	export let deleteFn: (params: {
		missionControlId: Principal;
		cyclesToDeposit: bigint;
	}) => Promise<void>;

	let steps: 'init' | 'in_progress' | 'error' = 'init';

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');

	// 1T cycles per default
	let tCycles = 1;

	let cycles: bigint;
	$: (() => {
		if (isNaN(tCycles)) {
			return;
		}

		cycles = BigInt(tCycles * ONE_TRILLION);
	})();

	let cyclesToDeposit: bigint;
	$: cyclesToDeposit = currentCycles - cycles > 0 ? currentCycles - cycles : 0n;

	let validConfirm = false;
	$: validConfirm = cycles > 0 && cycles <= currentCycles;

	const onSubmit = async () => {
		if (!$authSignedInStore) {
			toasts.error({
				text: $i18n.errors.no_identity
			});
			return;
		}

		if (isNullish($missionControlStore)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		if (cyclesToDeposit > currentCycles || cyclesToDeposit === 0n) {
			toasts.error({
				text: $i18n.canisters.invalid_cycles_to_retain
			});
			return;
		}

		steps = 'in_progress';

		wizardBusy.start();

		try {
			await deleteFn({
				missionControlId: $missionControlStore,
				cyclesToDeposit
			});

			await loadSatellites({
				missionControl: $missionControlStore,
				reload: true
			});

			await goto('/', { replaceState: true });

			close();

			toasts.success(
				i18nCapitalize(
					i18nFormat($i18n.canisters.delete_success, [
						{
							placeholder: '{0}',
							value: segment
						}
					])
				)
			);
		} catch (err: unknown) {
			steps = 'error';

			toasts.error({
				text: $i18n.errors.canister_delete,
				detail: err
			});
		}

		wizardBusy.stop();
	};
</script>

<Modal on:junoClose>
	{#if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.canisters.delete_in_progress}</p>
		</SpinnerModal>
	{:else}
		<form on:submit|preventDefault={onSubmit}>
			<h2>
				{@html i18nFormat($i18n.canisters.delete_title, [
					{
						placeholder: '{0}',
						value: segment.replace('_', ' ')
					}
				])}
			</h2>

			<p>
				{@html i18nFormat($i18n.canisters.delete_explanation, [
					{
						placeholder: '{0}',
						value: segment.replace('_', ' ')
					},
					{
						placeholder: '{1}',
						value: segment.replace('_', ' ')
					}
				])}
			</p>

			<p>
				{@html i18nFormat($i18n.canisters.delete_customization, [
					{
						placeholder: '{0}',
						value: segment.replace('_', ' ')
					},
					{
						placeholder: '{1}',
						value: formatTCycles(currentCycles)
					}
				])}
			</p>

			<Value ref="cycles">
				<svelte:fragment slot="label">{$i18n.canisters.cycles_to_retain}</svelte:fragment>

				<Input
					name="cycles"
					inputType="icp"
					required
					bind:value={tCycles}
					placeholder={$i18n.canisters.amount}
				/>
			</Value>

			<p>
				<small
					>{@html i18nFormat($i18n.canisters.cycles_to_transfer, [
						{
							placeholder: '{0}',
							value: formatTCycles(cyclesToDeposit)
						}
					])}</small
				>
			</p>

			<p class="warning">
				<IconWarning />
				{@html i18nFormat($i18n.canisters.delete_info, [
					{
						placeholder: '{0}',
						value: segment.replace('_', ' ')
					}
				])}
			</p>

			<button type="submit" class="submit" disabled={$isBusy || !validConfirm}>
				{$i18n.core.delete}
			</button>
		</form>
	{/if}
</Modal>

<style lang="scss">
	.warning {
		padding: var(--padding) 0 0;
	}
</style>
