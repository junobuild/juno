<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { CanisterSegmentWithLabel, CanisterSettings } from '$lib/types/canister';
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

	export let detail: JunoModalDetail;

	let segment: CanisterSegmentWithLabel;
	let settings: CanisterSettings;

	$: ({ segment, settings } = detail as JunoModalEditCanisterSettingsDetail);

	let freezingThreshold: number;
	const initFreezingThreshold = (threshold: bigint) => (freezingThreshold = Number(threshold));
	$: initFreezingThreshold(settings.freezingThreshold);

	let disabled = true;
	$: disabled =
		BigInt(freezingThreshold ?? 0n) === settings.freezingThreshold || freezingThreshold === 0;

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
				...settings,
				freezingThreshold: BigInt(freezingThreshold)
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
			<Value>
				<svelte:fragment slot="label"
					>{$i18n.canisters.freezing_threshold} ({$i18n.canisters.in_seconds})</svelte:fragment
				>
				<Input
					inputType="number"
					placeholder={$i18n.collections.max_capacity_placeholder}
					name="freezingThreshold"
					required={false}
					bind:value={freezingThreshold}
				/>
			</Value>

			<button type="submit" disabled={disabled || $isBusy}>
				{$i18n.core.submit}
			</button>
		</form>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
