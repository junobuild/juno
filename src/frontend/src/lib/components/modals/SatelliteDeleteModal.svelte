<script lang="ts">
	import type { JunoModalCyclesSatelliteDetail, JunoModalDetail } from '$lib/types/modal';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { deleteSatellite } from '$lib/api/mission-control.api';
	import type { Principal } from '@dfinity/principal';
	import CanisterDeleteModal from '$lib/components/modals/CanisterDeleteModal.svelte';
	import { authStore } from '$lib/stores/auth.store';

	export let detail: JunoModalDetail;

	let satellite: Satellite;
	let currentCycles: bigint;

	$: ({ satellite, cycles: currentCycles } = detail as JunoModalCyclesSatelliteDetail);

	let deleteFn: (params: { missionControlId: Principal; cyclesToDeposit: bigint }) => Promise<void>;
	$: deleteFn = async (params: { missionControlId: Principal; cyclesToDeposit: bigint }) =>
		deleteSatellite({
			...params,
			satelliteId: satellite.satellite_id,
			identity: $authStore.identity
		});
</script>

<CanisterDeleteModal {deleteFn} {currentCycles} on:junoClose segment="satellite" />
