<script lang="ts">
	import { createEventDispatcher } from 'svelte';
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

	let steps: 'init' | 'in_progress' | 'ready' | 'error' = 'init';
	let satellite: Satellite | undefined = undefined;

	const onSubmit = async () => {
		if (isNullish(satelliteName)) {
			toasts.error({
				text: `A name for the satellite must be provided.`
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
				text: `Error while creating the satellite.`,
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
			<p>Your satellite is ready.</p>
			<button on:click={navigate}>Continue</button>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>Initializing your new satellite...</p>
		</SpinnerModal>
	{:else}
		<h2>Let's create a new satellite</h2>

		<p>
			A satellite is a web3 container. This smart contract contains a simplistic datastore, storage
			and permission scheme. It can be use to develop and run your application on the web, 100% on
			chain with a lost carbon cost.
		</p>

		<p>Starting a new satellite needs 10 credits. Your current balance is ...</p>

		<form on:submit|preventDefault={onSubmit}>
			<input
				bind:value={satelliteName}
				type="text"
				name="satellite_name"
				placeholder="Satellite name"
			/>

			<button type="submit" disabled={!$authSignedInStore || isNullish($missionControlStore)}
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
</style>
