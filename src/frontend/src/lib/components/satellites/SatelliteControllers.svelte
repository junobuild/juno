<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { listControllers } from '$lib/api/satellites.api';
	import type { Principal } from '@dfinity/principal';
	import {
		deleteSatellitesController,
		setSatellitesController
	} from '$lib/api/mission-control.api';
	import Controllers from '$lib/components/controllers/Controllers.svelte';
	import type { Controller } from '$declarations/mission_control/mission_control.did';
	import type { SetControllerParams } from '$lib/types/controllers';
	import { i18n } from '$lib/stores/i18n.store';
	import { authStore } from '$lib/stores/auth.store';

	export let satellite: Satellite;

	const list = (): Promise<[Principal, Controller][]> =>
		listControllers({ satelliteId: satellite.satellite_id, identity: $authStore.identity });

	const remove = (params: { missionControlId: Principal; controller: Principal }): Promise<void> =>
		deleteSatellitesController({
			...params,
			satelliteIds: [satellite.satellite_id],
			identity: $authStore.identity
		});

	const add = (
		params: {
			missionControlId: Principal;
		} & SetControllerParams
	): Promise<void> =>
		setSatellitesController({
			...params,
			satelliteIds: [satellite.satellite_id],
			identity: $authStore.identity
		});
</script>

<Controllers
	{list}
	{remove}
	{add}
	segment={{ label: $i18n.satellites.satellite, id: satellite.satellite_id }}
/>
