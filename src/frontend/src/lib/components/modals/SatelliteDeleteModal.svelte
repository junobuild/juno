<script lang="ts">
	import type { JunoModalDeleteSatelliteDetail, JunoModalDetail } from '$lib/types/modal';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { deleteSatellite } from '$lib/api/mission-control.api';
	import type { Principal } from '@dfinity/principal';
	import CanisterDeleteModal from '$lib/components/modals/CanisterDeleteModal.svelte';

	export let detail: JunoModalDetail;

	let satellite: Satellite;
	let currentCycles: bigint;

	$: ({ satellite, cycles: currentCycles } = detail as JunoModalDeleteSatelliteDetail);

	let deleteFn: (params: {
		missionControlId: Principal;
		cycles_to_retain: bigint;
	}) => Promise<void>;
	$: deleteFn = async (params: { missionControlId: Principal; cycles_to_retain: bigint }) =>
		deleteSatellite({
			...params,
			satelliteId: satellite.satellite_id
		});
</script>

<CanisterDeleteModal {deleteFn} {currentCycles} on:junoClose segment="satellite" />
