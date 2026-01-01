<script lang="ts">
	import type { Principal } from '@icp-sdk/core/principal';
	import type { MissionControlDid } from '$declarations';
	import {
		deleteSatellitesController,
		setSatellitesController
	} from '$lib/api/mission-control.api';
	import { listControllers } from '$lib/api/satellites.api';
	import AccessKeys from '$lib/components/access-keys/AccessKeys.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import {
		addAccessKey,
		type AddAccessKeyWithDevFn,
		type AddAccessKeyWithMissionControlFn
	} from '$lib/services/access-keys/key.add.services';
	import { addSatellitesAccessKey } from '$lib/services/access-keys/satellites.key.add.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { AddAccessKeyResult, AddAccessKeyParams } from '$lib/types/access-keys';
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

	const add = async (accessKey: AddAccessKeyParams): Promise<AddAccessKeyResult> => {
		const satelliteIds = [satellite.satellite_id];

		const addAccessKeyWithMissionControlFn: AddAccessKeyWithMissionControlFn = async (params) => {
			await setSatellitesController({
				...accessKey,
				...params,
				satelliteIds
			});
		};

		const addAccessKeyWithDevFn: AddAccessKeyWithDevFn = async (params) => {
			await addSatellitesAccessKey({
				...accessKey,
				...params,
				satelliteIds
			});
		};

		return await addAccessKey({
			identity: $authIdentity,
			missionControlId: $missionControlId,
			accessKey,
			addAccessKeyWithMissionControlFn,
			addAccessKeyWithDevFn
		});
	};
</script>

<AccessKeys
	{add}
	{list}
	{remove}
	segment={{
		label: $i18n.satellites.satellite,
		canisterId: satellite.satellite_id.toText(),
		segment: 'satellite'
	}}
/>
