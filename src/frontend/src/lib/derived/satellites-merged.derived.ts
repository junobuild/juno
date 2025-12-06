import type { MissionControlDid } from '$declarations';
import { canistersSyncDataUncertifiedStore } from '$lib/stores/ic-mgmt/canister-sync-data.store';
import type { SegmentWithSyncData } from '$lib/types/satellite';
import { nonNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';
import {sortedSatellites} from "$lib/derived/satellites.derived";

export const satellitesWithSyncData = derived(
	[sortedSatellites, canistersSyncDataUncertifiedStore],
	([$sortedSatellites, $canistersSyncDataUncertifiedStore]) =>
		$sortedSatellites.reduce<SegmentWithSyncData<MissionControlDid.Satellite>[]>(
			(acc, { satellite_id, ...rest }) => {
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
			},
			[]
		)
);
