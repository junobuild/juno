import type { SatelliteDid } from '$declarations';
import { satellite } from '$lib/derived/satellite.derived';
import { uncertifiedSatellitesConfigsStore } from '$lib/stores/satellite/satellites-configs.store';
import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

const satelliteConfig = derived(
	[satellite, uncertifiedSatellitesConfigsStore],
	([$satellite, $uncertifiedSatellitesConfigsStore]) =>
		isNullish($satellite)
			? undefined
			: $uncertifiedSatellitesConfigsStore?.[$satellite.satellite_id.toText()]
);

// In the Authentication screen, knowing if loading the authentication configuration succeeded or not is interpreted
export const satelliteAuthConfig: Readable<{
	result: 'success' | 'error' | 'loading';
	config?: SatelliteDid.AuthenticationConfig | null;
}> = derived([satelliteConfig], ([$satelliteConfig]) => {
	// Undefined not loaded
	if ($satelliteConfig === undefined) {
		return { result: 'loading' as const };
	}

	// Null set if an error occurred
	if (isNullish($satelliteConfig)) {
		return { result: 'error' as const };
	}

	const config = fromNullable($satelliteConfig.data.authentication);
	return { result: 'success' as const, config: nonNullish(config) ? config : null };
});

export const satelliteAutomationConfig = derived([satelliteConfig], ([$satelliteConfig]) => {
	// Undefined not loaded or null as set as such
	if (isNullish($satelliteConfig)) {
		return $satelliteConfig;
	}

	const config = fromNullable($satelliteConfig.data.automation);
	return nonNullish(config) ? config : null;
});
