import { segmentsUncertifiedStore } from '$lib/stores/console/segments.store';
import type { Orbiter } from '$lib/types/orbiter';
import type { Satellite } from '$lib/types/satellite';
import { derived } from 'svelte/store';

export const segments = derived(
	[segmentsUncertifiedStore],
	([$segmentsUncertifiedStore]) => $segmentsUncertifiedStore?.data
);

export const consoleSatellites = derived([segments], ([$segments]) =>
	$segments
		?.filter(([{ segment_kind }]) => 'Satellite' in segment_kind)
		.map<Satellite>(([_, { segment_id, ...rest }]) => ({
			satellite_id: segment_id,
			settings: [],
			...rest
		}))
);

export const consoleOrbiters = derived([segments], ([$segments]) =>
	$segments
		?.filter(([{ segment_kind }]) => 'Orbiter' in segment_kind)
		.map<Orbiter>(([_, { segment_id, ...rest }]) => ({
			orbiter_id: segment_id,
			settings: [],
			...rest
		}))
);
