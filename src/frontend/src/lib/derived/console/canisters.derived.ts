import { consoleCanisters } from '$lib/derived/console/segments.derived';
import type { Satellite } from '$lib/types/satellite';
import type { SegmentCanisterUi } from '$lib/types/segment';
import { satelliteMetadata, satelliteName } from '$lib/utils/satellite.utils';
import { derived } from 'svelte/store';

export const sortedCanisters = derived([consoleCanisters], ([$consoleCanisters]) =>
	// TODO: make functions generic
	($consoleCanisters ?? []).sort((a, b) =>
		satelliteName(a as unknown as Satellite).localeCompare(satelliteName(b as unknown as Satellite))
	)
);

export const sortedCanisterUis = derived([sortedCanisters], ([$sortedCanisters]) =>
	$sortedCanisters.map<SegmentCanisterUi>((segment) => ({
		...segment,
		// TODO: make function generic
		metadata: satelliteMetadata(segment as unknown as Satellite)
	}))
);
