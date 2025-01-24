import type { Satellite } from '$declarations/mission_control/mission_control.did';
import { sortedSatellites } from '$lib/derived/satellites.derived';
import { canistersSyncDataUncertifiedStore } from '$lib/stores/canister-sync-data.store';
import type { SegmentWithSyncData } from '$lib/types/satellite';
import { nonNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const satellitesWithSyncData = derived(
	[sortedSatellites, canistersSyncDataUncertifiedStore],
	([$sortedSatellites, $canistersSyncDataUncertifiedStore]) =>
		$sortedSatellites.reduce<SegmentWithSyncData<Satellite>[]>((acc, { satellite_id, ...rest }) => {
			const canister = $canistersSyncDataUncertifiedStore?.[satellite_id.toText()]?.data;

			return [
				...acc,
				...(nonNullish(canister)
					? [
							{
								segment: { satellite_id, ...rest },
								canister
							}
						]
					: [])
			];
		}, [])
);
