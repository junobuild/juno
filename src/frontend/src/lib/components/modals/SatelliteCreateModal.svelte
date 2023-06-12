<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { authSignedInStore } from '$lib/stores/auth.store';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { navigateToSatellite } from '$lib/utils/nav.utils';
	import { createSatellite, loadSatellites } from '$lib/services/satellites.services';
	import { toasts } from '$lib/stores/toasts.store';
	import { isNullish } from '$lib/utils/utils';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalCreateSatelliteDetail, JunoModalDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatE8sICP } from '$lib/utils/icp.utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { wizardBusy } from '$lib/stores/busy.store';
	import WhatNext from '$lib/components/onboarding/WhatNext.svelte';
	import InstallSDK from '$lib/components/onboarding/InstallSDK.svelte';
	import Deploy from "$lib/components/onboarding/Deploy.svelte";

	export let detail: JunoModalDetail;

	let fee = 0n;
	let balance = 0n;
	let credits = 0n;

	$: fee = (detail as JunoModalCreateSatelliteDetail).fee;
	$: balance = (detail as JunoModalCreateSatelliteDetail).missionControlBalance?.balance ?? 0n;
	$: credits = (detail as JunoModalCreateSatelliteDetail).missionControlBalance?.credits ?? 0n;

	let insufficientFunds = true;
	$: insufficientFunds = balance + credits < fee;

	let notEnoughCredits = false;
	$: notEnoughCredits = credits < fee;

	let steps: 'init' | 'in_progress' | 'ready' | 'sdk' | 'deploy' | 'error' = 'init';
	let satellite: Satellite | undefined = undefined;

	const onSubmit = async () => {
		if (isNullish(satelliteName)) {
			toasts.error({
				text: $i18n.errors.satellite_name_missing
			});
			return;
		}

		wizardBusy.start();
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

		wizardBusy.stop();
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
		<WhatNext on:junoSkip={navigate} on:junoNext={({ detail }) => (steps = detail)} />
	{:else if steps === 'sdk'}
		<InstallSDK {satellite} on:junoContinue={() => steps = "deploy"} />
	{:else if steps === 'deploy'}
		<Deploy {satellite} on:junoDone={navigate} />
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.satellites.initializing}</p>
		</SpinnerModal>
	{:else}
		<h2>{$i18n.satellites.start}</h2>

		<p>
			{$i18n.satellites.description}
		</p>

		{#if notEnoughCredits}
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

		{#if insufficientFunds}
			<button on:click={close}>Close</button>
		{:else}
			<form on:submit|preventDefault={onSubmit}>
				<Value>
					<svelte:fragment slot="label">{$i18n.satellites.satellite_name}</svelte:fragment>
					<input
						bind:value={satelliteName}
						type="text"
						name="satellite_name"
						placeholder={$i18n.satellites.enter_name}
						required
					/>
				</Value>

				<button
					type="submit"
					disabled={!$authSignedInStore || isNullish($missionControlStore) || insufficientFunds}
					>{$i18n.satellites.create}</button
				>
			</form>
		{/if}
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	h2 {
		@include overlay.title;
	}

	form {
		display: flex;
		flex-direction: column;
	}

	button {
		margin-top: var(--padding-2x);
	}
</style>
