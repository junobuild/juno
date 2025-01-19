<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { createEventDispatcher } from 'svelte';
	import { preventDefault } from 'svelte/legacy';
	import Html from '$lib/components/ui/Html.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { ONE_TRILLION } from '$lib/constants/app.constants';
	import { updateSettings as updateSettingsServices } from '$lib/services/settings.services';
	import { authStore } from '$lib/stores/auth.store';
	import { isBusy, wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterLogVisibility } from '$lib/types/canister';
	import type { JunoModalDetail, JunoModalEditCanisterSettingsDetail } from '$lib/types/modal';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { emit } from '$lib/utils/events.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		detail: JunoModalDetail;
	}

	let { detail }: Props = $props();

	let { segment, settings } = $derived(detail as JunoModalEditCanisterSettingsDetail);

	let freezingThreshold: number = $state(
		Number((detail as JunoModalEditCanisterSettingsDetail).settings.freezingThreshold)
	);

	let reservedTCyclesLimit: number = $state(
		Number(
			formatTCycles((detail as JunoModalEditCanisterSettingsDetail).settings.reservedCyclesLimit)
		)
	);

	let logVisibility: CanisterLogVisibility = $state(
		(detail as JunoModalEditCanisterSettingsDetail).settings.logVisibility
	);

	let wasmMemoryLimit: number = $state(
		Number((detail as JunoModalEditCanisterSettingsDetail).settings.wasmMemoryLimit)
	);

	let memoryAllocation: number = $state(
		Number((detail as JunoModalEditCanisterSettingsDetail).settings.memoryAllocation)
	);

	let computeAllocation: number = $state(
		Number((detail as JunoModalEditCanisterSettingsDetail).settings.computeAllocation)
	);

	let reservedCyclesLimit: bigint = $derived(BigInt(reservedTCyclesLimit * ONE_TRILLION));

	let disabled = $derived(
		(BigInt(freezingThreshold ?? 0n) === settings.freezingThreshold || freezingThreshold === 0) &&
			reservedCyclesLimit === settings.reservedCyclesLimit &&
			logVisibility === settings.logVisibility &&
			BigInt(wasmMemoryLimit ?? 0n) === settings.wasmMemoryLimit &&
			BigInt(memoryAllocation ?? 0n) === settings.memoryAllocation &&
			BigInt(computeAllocation ?? 0n) === settings.computeAllocation
	);

	let step: 'edit' | 'in_progress' | 'ready' = $state('edit');

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');

	const updateSettings = async () => {
		wizardBusy.start();
		step = 'in_progress';

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
			step = 'edit';
			return;
		}

		emit({ message: 'junoRestartCycles', detail: { canisterId } });

		step = 'ready';
	};
</script>

<Modal on:junoClose>
	{#if step === 'ready'}
		<div class="msg">
			<p>
				<Html
					text={i18nFormat($i18n.canisters.settings_updated_text, [
						{
							placeholder: '{0}',
							value: segment.label
						}
					])}
				/>
			</p>
			<button onclick={close}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
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

		<form class="content" onsubmit={preventDefault(updateSettings)}>
			<div class="container">
				<div>
					<Value>
						{#snippet label()}
							{$i18n.canisters.freezing_threshold} ({$i18n.canisters.in_seconds})
						{/snippet}
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
						{#snippet label()}
							{$i18n.canisters.reserved_cycles_limit} ({$i18n.canisters.in_t_cycles})
						{/snippet}
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
						{#snippet label()}
							{$i18n.canisters.log_visibility}
						{/snippet}
						<select id="logVisibility" name="logVisibility" bind:value={logVisibility}>
							<option value="controllers">{$i18n.canisters.controllers}</option>
							<option value="public">{$i18n.canisters.public}</option>
						</select>
					</Value>
				</div>

				<div class="row-1 column-2">
					<Value>
						{#snippet label()}
							{$i18n.canisters.heap_memory_limit} ({$i18n.canisters.in_bytes})
						{/snippet}
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
						{#snippet label()}
							{$i18n.canisters.memory_allocation} ({$i18n.canisters.in_bytes})
						{/snippet}
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
						{#snippet label()}
							{$i18n.canisters.compute_allocation} ({$i18n.canisters.in_percent})
						{/snippet}
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
	@use '../../styles/mixins/grid';

	.msg {
		@include overlay.message;
	}

	.container {
		margin: var(--padding-4x) 0;

		@include media.min-width(large) {
			@include grid.two-columns;

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
