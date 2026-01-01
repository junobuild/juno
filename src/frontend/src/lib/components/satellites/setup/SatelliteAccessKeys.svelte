<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import type { MissionControlDid } from '$declarations';
	import {
		deleteSatellitesController,
		setSatellitesController
	} from '$lib/api/mission-control.api';
	import { listControllers } from '$lib/api/satellites.api';
	import Controllers from '$lib/components/access-keys/AccessKeys.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { SetAccessKeyParams } from '$lib/types/controllers';
	import type { MissionControlId } from '$lib/types/mission-control';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	const list = (): Promise<[Principal, MissionControlDid.Controller][]> =>
		listControllers({ satelliteId: satellite.satellite_id, identity: $authIdentity });

	const remove = (params: {
		missionControlId: MissionControlId;
		controller: Principal;
	}): Promise<void> =>
		deleteSatellitesController({
			...params,
			satelliteIds: [satellite.satellite_id],
			identity: $authIdentity
		});

	const add = (
		params: {
			missionControlId: MissionControlId;
		} & SetAccessKeyParams
	): Promise<void> =>
		setSatellitesController({
			...params,
			satelliteIds: [satellite.satellite_id],
			identity: $authIdentity
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
