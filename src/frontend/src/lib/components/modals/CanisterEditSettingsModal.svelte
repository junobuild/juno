<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import type {
		CanisterLogVisibility,
		CanisterSegmentWithLabel,
		CanisterSettings
	} from '$lib/types/canister';
	import type { JunoModalDetail, JunoModalEditCanisterSettingsDetail } from '$lib/types/modal';
	import { createEventDispatcher } from 'svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { updateSettings as updateSettingsServices } from '$lib/services/settings.services';
	import { Principal } from '@dfinity/principal';
	import { authStore } from '$lib/stores/auth.store';
	import { emit } from '$lib/utils/events.utils';
	import { isBusy, wizardBusy } from '$lib/stores/busy.store';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { ONE_TRILLION } from '$lib/constants/constants';

	export let detail: JunoModalDetail;

	let segment: CanisterSegmentWithLabel;
	let settings: CanisterSettings;

	$: ({ segment, settings } = detail as JunoModalEditCanisterSettingsDetail);

	let freezingThreshold: number;
	const initFreezingThreshold = (threshold: bigint) => (freezingThreshold = Number(threshold));
	$: initFreezingThreshold(settings.freezingThreshold);

	let reservedTCyclesLimit: number;
	const initReservedTCyclesLimit = (cycles: bigint) =>
		(reservedTCyclesLimit = Number(formatTCycles(cycles)));
	$: initReservedTCyclesLimit(settings.reservedCyclesLimit);

	let logVisibility: CanisterLogVisibility;
	const initLogVisibility = (visibility: CanisterLogVisibility) => (logVisibility = visibility);
	$: initLogVisibility(settings.logVisibility);

	let reservedCyclesLimit: bigint;
	$: reservedCyclesLimit = BigInt(reservedTCyclesLimit * ONE_TRILLION);

	let wasmMemoryLimit: number;
	const initWasmMemoryLimit = (memoryLimit: bigint) => (wasmMemoryLimit = Number(memoryLimit));
	$: initWasmMemoryLimit(settings.wasmMemoryLimit);

	let memoryAllocation: number;
	const initMemoryAllocation = (memory: bigint) => (memoryAllocation = Number(memory));
	$: initMemoryAllocation(settings.memoryAllocation);

	let computeAllocation: number;
	const initComputeAllocation = (memory: bigint) => (computeAllocation = Number(memory));
	$: initComputeAllocation(settings.computeAllocation);

	let disabled = true;
	$: disabled =
		(BigInt(freezingThreshold ?? 0n) === settings.freezingThreshold || freezingThreshold === 0) &&
		reservedCyclesLimit === settings.reservedCyclesLimit &&
		logVisibility === settings.logVisibility &&
		BigInt(wasmMemoryLimit ?? 0n) === settings.wasmMemoryLimit &&
		BigInt(memoryAllocation ?? 0n) === settings.memoryAllocation &&
		BigInt(computeAllocation ?? 0n) === settings.computeAllocation;

	let steps: 'edit' | 'in_progress' | 'ready' = 'edit';

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');

	const updateSettings = async () => {
		wizardBusy.start();
		steps = 'in_progress';

		const canisterId = Principal.from(segment.canisterId);

		const { success } = await updateSettingsServices({
			canisterId,
			currentSettings: settings,
			newSettings: {
				freezingThreshold: BigInt(freezingThreshold),
				reservedCyclesLimit: reservedCyclesLimit,
				logVisibility,
				wasmMemoryLimit: BigInt(wasmMemoryLimit),
				memoryAllocation: BigInt(memoryAllocation),
				computeAllocation: BigInt(computeAllocation)
			},
			identity: $authStore.identity
		});

		wizardBusy.stop();

		if (success !== 'ok') {
			steps = 'edit';
			return;
		}

		emit({ message: 'junoRestartCycles', detail: { canisterId } });

		steps = 'ready';
	};
</script>

<Modal on:junoClose>
	{#if steps === 'ready'}
		<div class="msg">
			<p>
				{@html i18nFormat($i18n.canisters.settings_updated_text, [
					{
						placeholder: '{0}',
						value: segment.label
					}
				])}
			</p>
			<button on:click={close}>{$i18n.core.close}</button>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.canisters.updating_settings}</p>
		</SpinnerModal>
	{:else}
		<h2>{$i18n.canisters.edit_settings}</h2>

		<p>
			{i18nFormat($i18n.canisters.edit_settings_segment, [
				{ placeholder: '{0}', value: segment.label }
			])}
		</p>

		<form class="content" on:submit|preventDefault={updateSettings}>
			<div class="container">
				<div>
					<Value>
						<svelte:fragment slot="label"
							>{$i18n.canisters.freezing_threshold} ({$i18n.canisters.in_seconds})</svelte:fragment
						>
						<Input
							inputType="number"
							name="freezingThreshold"
							placeholder=""
							bind:value={freezingThreshold}
						/>
					</Value>
				</div>

				<div>
					<Value>
						<svelte:fragment slot="label"
							>{$i18n.canisters.reserved_cycles_limit} ({$i18n.canisters
								.in_t_cycles})</svelte:fragment
						>
						<Input
							inputType="number"
							name="reservedCyclesLimit"
							placeholder=""
							bind:value={reservedTCyclesLimit}
						/>
					</Value>
				</div>

				<div>
					<Value>
						<svelte:fragment slot="label">{$i18n.canisters.log_visibility}</svelte:fragment>
						<select id="logVisibility" name="logVisibility" bind:value={logVisibility}>
							<option value="controllers">{$i18n.canisters.controllers}</option>
							<option value="public">{$i18n.canisters.public}</option>
						</select>
					</Value>
				</div>

				<div class="row-1 column-2">
					<Value>
						<svelte:fragment slot="label"
							>{$i18n.canisters.wasm_memory_limit} ({$i18n.canisters.in_bytes})</svelte:fragment
						>
						<Input
							inputType="number"
							name="wasmMemoryLimit"
							placeholder=""
							bind:value={wasmMemoryLimit}
						/>
					</Value>
				</div>

				<div class="row-2 column-2">
					<Value>
						<svelte:fragment slot="label"
							>{$i18n.canisters.memory_allocation} ({$i18n.canisters.in_bytes})</svelte:fragment
						>
						<Input
							inputType="number"
							name="memoryAllocation"
							placeholder=""
							bind:value={memoryAllocation}
						/>
					</Value>
				</div>

				<div class="column-2">
					<Value>
						<svelte:fragment slot="label"
							>{$i18n.canisters.compute_allocation} ({$i18n.canisters.in_percent})</svelte:fragment
						>
						<Input
							inputType="number"
							name="computeAllocation"
							placeholder=""
							max={100}
							bind:value={computeAllocation}
						/>
					</Value>
				</div>
			</div>

			<button type="submit" disabled={disabled || $isBusy}>
				{$i18n.core.submit}
			</button>
		</form>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';
	@use '../../styles/mixins/media';

	.msg {
		@include overlay.message;
	}

	.container {
		margin: var(--padding-4x) 0;

		@include media.min-width(large) {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			column-gap: var(--padding-4x);
			row-gap: var(--padding);

			.row-1 {
				grid-row-start: 1;
			}

			.row-2 {
				grid-row-start: 2;
			}

			.column-2 {
				grid-column-start: 2;
			}
		}
	}
</style>
