<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { depositCycles } from '$lib/api/satellites.api';
	import CanisterTransferCyclesModal from '$lib/components/modals/CanisterTransferCyclesModal.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import type { JunoModalCyclesSatelliteDetail, JunoModalDetail } from '$lib/types/modal';

	export let detail: JunoModalDetail;

	let satellite: Satellite;
	let currentCycles: bigint;

	$: ({ satellite, cycles: currentCycles } = detail as JunoModalCyclesSatelliteDetail);

	let transferFn: (params: { cycles: bigint; destinationId: Principal }) => Promise<void>;
	$: transferFn = async (params: { cycles: bigint; destinationId: Principal }) =>
		depositCycles({
			...params,
			satelliteId: satellite.satellite_id,
			identity: $authStore.identity
		});
</script>

<CanisterTransferCyclesModal
	{transferFn}
	{currentCycles}
	canisterId={satellite.satellite_id}
	on:junoClose
	segment="satellite"
/>
