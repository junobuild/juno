<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import {
		type Satellite,
		type Controller
	} from '$declarations/mission_control/mission_control.did';
	import {
		deleteSatellitesController,
		setSatellitesController
	} from '$lib/api/mission-control.api';
	import { listControllers } from '$lib/api/satellites.api';
	import Controllers from '$lib/components/controllers/Controllers.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SetControllerParams } from '$lib/types/controllers';

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
	segment={{
		label: $i18n.satellites.satellite,
		canisterId: satellite.satellite_id.toText(),
		segment: 'satellite'
	}}
/>
