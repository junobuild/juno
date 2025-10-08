<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import {
		deleteSatellitesController,
		setSatellitesController
	} from '$lib/api/mission-control.api';
	import { listControllers } from '$lib/api/satellites.api';
	import Controllers from '$lib/components/controllers/Controllers.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SetControllerParams } from '$lib/types/controllers';
	import type { MissionControlDid } from '$lib/types/declarations';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		satellite: MissionControlDid.Satellite;
	}

	let { satellite }: Props = $props();

	const list = (): Promise<[Principal, MissionControlDid.Controller][]> =>
		listControllers({ satelliteId: satellite.satellite_id, identity: $authStore.identity });

	const remove = (params: {
		missionControlId: MissionControlId;
		controller: Principal;
	}): Promise<void> =>
		deleteSatellitesController({
			...params,
			satelliteIds: [satellite.satellite_id],
			identity: $authStore.identity
		});

	const add = (
		params: {
			missionControlId: MissionControlId;
		} & SetControllerParams
	): Promise<void> =>
		setSatellitesController({
			...params,
			satelliteIds: [satellite.satellite_id],
			identity: $authStore.identity
		});
</script>

<Controllers
	{add}
	{list}
	{remove}
	segment={{
		label: $i18n.satellites.satellite,
		canisterId: satellite.satellite_id.toText(),
		segment: 'satellite'
	}}
/>
