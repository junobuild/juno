<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { createEventDispatcher } from 'svelte';
	import { run } from 'svelte/legacy';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { deleteSatellite } from '$lib/api/mission-control.api';
	import CanisterDeleteWizard from '$lib/components/canister/CanisterDeleteWizard.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { satelliteCustomDomains } from '$lib/derived/custom-domains.derived';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDeleteSatelliteDetail, JunoModalDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		detail: JunoModalDetail;
	}

	let { detail }: Props = $props();

	let { satellite, cycles: currentCycles } = $derived(detail as JunoModalDeleteSatelliteDetail);

	let deleteFn: (params: {
		missionControlId: Principal;
		cyclesToDeposit: bigint;
	}) => Promise<void> = $derived(
		async (params: { missionControlId: Principal; cyclesToDeposit: bigint }) =>
			await deleteSatellite({
				...params,
				satelliteId: satellite.satellite_id,
				identity: $authStore.identity
			})
	);

	const dispatch = createEventDispatcher();
	const close = () => dispatch('junoClose');
</script>

<Modal on:junoClose>
	{#if $satelliteCustomDomains.length > 0}
		<h2>
			<Html
				text={i18nFormat($i18n.canisters.delete_title, [
					{
						placeholder: '{0}',
						value: 'satellite'
					}
				])}
			/>
		</h2>

		<p>
			{$i18n.canisters.delete_custom_domain}
		</p>

		<button onclick={close}>{$i18n.core.close}</button>
	{:else}
		<CanisterDeleteWizard {deleteFn} {currentCycles} on:junoClose segment="satellite" />
	{/if}
</Modal>
