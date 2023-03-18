<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { listControllers } from '$lib/api/satellites.api';
	import type { Principal } from '@dfinity/principal';
	import { deleteSatellitesController } from '$lib/api/mission-control.api';
	import Controllers from '$lib/components/canister/Controllers.svelte';
	import type { Controller } from '$declarations/mission_control/mission_control.did';

	export let satellite: Satellite;

	let controllers: Principal[] = [];

	const list = (): Promise<[Principal, Controller][]> =>
		listControllers({ satelliteId: satellite.satellite_id });

	const remove = (params: { missionControlId: Principal; controller: Principal }): Promise<void> =>
		deleteSatellitesController({
			...params,
			satelliteIds: [satellite.satellite_id]
		});
</script>

<Controllers {list} {remove} />
