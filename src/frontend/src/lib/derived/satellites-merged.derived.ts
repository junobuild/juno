import { sortedSatellites } from '$lib/derived/satellites.derived';
import { canistersSyncDataStore } from '$lib/stores/ic-mgmt/canister-sync-data.store';
import type { Satellite } from '$lib/types/satellite';
import type { SegmentWithSyncData } from '$lib/types/segment';
import { nonNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const satellitesWithSyncData = derived(
	[sortedSatellites, canistersSyncDataStore],
	([$sortedSatellites, $canistersSyncDataStore]) =>
		$sortedSatellites.reduce<SegmentWithSyncData<Satellite>[]>((acc, { satellite_id, ...rest }) => {
			const canister = $canistersSyncDataStore?.[satellite_id.toText()]?.data;

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
