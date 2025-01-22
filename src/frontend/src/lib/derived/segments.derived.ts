import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
import { orbiterStore } from '$lib/derived/orbiter.derived';
import { sortedSatellites } from '$lib/derived/satellites.derived';
import type { CanisterSegment } from '$lib/types/canister';
import { nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const allSegments: Readable<CanisterSegment[]> = derived(
	[missionControlIdDerived, sortedSatellites, orbiterStore],
	([$missionControlIdDerived, $sortedSatellites, $orbiterStore]) => [
		...(nonNullish($missionControlIdDerived)
			? [
					{
						canisterId: $missionControlIdDerived.toText(),
						segment: 'mission_control' as const
					}
				]
			: []),
		...(nonNullish($orbiterStore)
			? [
					{
						canisterId: $orbiterStore.orbiter_id.toText(),
						segment: 'orbiter' as const
					}
				]
			: []),
		...$sortedSatellites.map(({ satellite_id }) => ({
			canisterId: satellite_id.toText(),
			segment: 'satellite' as const
		}))
	]
);
