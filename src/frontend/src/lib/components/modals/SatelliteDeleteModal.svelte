<script lang="ts">
	import type { JunoModalDeleteSatelliteDetail, JunoModalDetail } from '$lib/types/modal';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { deleteSatellite } from '$lib/api/mission-control.api';
	import type { Principal } from '@dfinity/principal';
	import CanisterDeleteWizard from '$lib/components/canister/CanisterDeleteWizard.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import type { CustomDomains } from '$lib/types/custom-domain';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { createEventDispatcher } from 'svelte';

	export let detail: JunoModalDetail;

	let satellite: Satellite;
	let currentCycles: bigint;
	let customDomains: CustomDomains;

	$: ({
		satellite,
		cycles: currentCycles,
		customDomains
	} = detail as JunoModalDeleteSatelliteDetail);

	let deleteFn: (params: { missionControlId: Principal; cyclesToDeposit: bigint }) => Promise<void>;
	$: deleteFn = async (params: { missionControlId: Principal; cyclesToDeposit: bigint }) =>
		deleteSatellite({
			...params,
			satelliteId: satellite.satellite_id,
			identity: $authStore.identity
		});

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');
</script>

<Modal on:junoClose>
	{#if customDomains.length > 0}
		<h2>
			{@html i18nFormat($i18n.canisters.delete_title, [
				{
					placeholder: '{0}',
					value: 'satellite'
				}
			])}
		</h2>

		<p>
			{$i18n.canisters.delete_custom_domain}
		</p>

		<button on:click={close}>{$i18n.core.close}</button>
	{:else}
		<CanisterDeleteWizard {deleteFn} {currentCycles} on:junoClose segment="satellite" />
	{/if}
</Modal>
