import { satellite } from '$lib/derived/satellite.derived';
import { uncertifiedSatellitesConfigsStore } from '$lib/stores/satellite/satellites-configs.store';
import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

const satelliteConfig = derived(
	[satellite, uncertifiedSatellitesConfigsStore],
	([$satellite, $uncertifiedSatellitesConfigsStore]) =>
		isNullish($satellite)
			? undefined
			: $uncertifiedSatellitesConfigsStore?.[$satellite.satellite_id.toText()]
);

export const satelliteAutomationConfig = derived([satelliteConfig], ([$satelliteConfig]) => {
	// Undefined not loaded or null as set as such
	if (isNullish($satelliteConfig)) {
		return $satelliteConfig;
	}

	const config = fromNullable($satelliteConfig.data.automation);
	return nonNullish(config) ? config : null;
});
