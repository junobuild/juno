<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { navigateToSatellite } from '$lib/utils/nav.utils';
	import { createSatellite, loadSatellites } from '$lib/services/satellites.services';
	import { toasts } from '$lib/stores/toasts.store';
	import { isNullish } from '$lib/utils/utils';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalCreateSatelliteDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatE8sICP } from '$lib/utils/icp.utils';

	export let detail: JunoModalCreateSatelliteDetail;

	let fee = 0n;
	let balance = 0n;
	let credits = 0n;

	$: fee = detail.fee;
	$: balance = detail.missionControlBalance?.balance ?? 0n;
	$: credits = detail.missionControlBalance?.credits ?? 0n;

	let insufficientFunds = true;
	$: insufficientFunds = balance + credits < fee;

	let steps: 'init' | 'in_progress' | 'ready' | 'error' = 'init';
	let satellite: Satellite | undefined = undefined;

	const onSubmit = async () => {
		if (isNullish(satelliteName)) {
			toasts.error({
				text: $i18n.errors.satellite_name_missing
			});
			return;
		}

		steps = 'in_progress';

		try {
			satellite = await createSatellite({
				missionControl: $missionControlStore,
				satelliteName
			});

			// Reload list of satellites before navigation
			await loadSatellites({ missionControl: $missionControlStore, reload: true });

			steps = 'ready';
		} catch (err) {
			toasts.error({
				text: $i18n.errors.satellite_unexpected_error,
				detail: err
			});

			steps = 'error';
		}
	};

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');

	const navigate = async () => {
		await navigateToSatellite(satellite?.satellite_id);
		close();
	};

	let satelliteName: string | undefined = undefined;
</script>

<Modal on:junoClose>
	{#if steps === 'ready'}
		<div class="msg">
			<IconSatellite />
			<p>{$i18n.satellites.ready}</p>
			<button on:click={navigate}>{$i18n.core.continue}</button>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.satellites.initializing}</p>
		</SpinnerModal>
	{:else}
		<h2>{$i18n.satellites.start}</h2>

		<p>
			{$i18n.satellites.description}
		</p>

		{#if insufficientFunds}
			<p>
				{@html i18nFormat($i18n.satellites.create_satellite_price, [
					{
						placeholder: '{0}',
						value: formatE8sICP(fee)
					},
					{
						placeholder: '{1}',
						value: formatE8sICP(balance)
					},
					{
						placeholder: '{2}',
						value: formatE8sICP(credits)
					}
				])}
			</p>
		{/if}

		<form on:submit|preventDefault={onSubmit}>
			<input
				bind:value={satelliteName}
				type="text"
				name="satellite_name"
				placeholder="Satellite name"
				required
			/>

			<button
				type="submit"
				disabled={!$authSignedInStore || isNullish($missionControlStore) || insufficientFunds}
				>{$i18n.satellites.create}</button
			>
		</form>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}

	form {
		display: flex;
		flex-direction: column;
	}
</style>
