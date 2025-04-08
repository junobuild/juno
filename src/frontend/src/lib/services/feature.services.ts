import { versionStore } from '$lib/stores/version.store';
import type { Principal } from '@dfinity/principal';
import { nonNullish } from '@dfinity/utils';
import { compare } from 'semver';
import { get } from 'svelte/store';

/**
 * We imperatively use the store to avoid boilerplate and also because originally the version was re-fetched imperatively many times.
 */
export const instantSatelliteVersion = ({
	satelliteId
}: {
	satelliteId: Principal;
}): string | undefined => get(versionStore)?.satellites[satelliteId.toText()]?.current;

/**
 * There is guard for loading the Satellite version. If we reach a point where this function is called in a service but provide `undefined`, it's probably a race condition.
 * In that case we fallback to the newest API - i.e. we assume the function is supported - since the version check is only needed for backward compatibility.
 */
export const isSatelliteFeatureSupported = ({
	satelliteId,
	requiredMinVersion
}: {
	satelliteId: Principal;
	requiredMinVersion: string;
}): boolean => {
	const satelliteVersion = instantSatelliteVersion({ satelliteId });
	return nonNullish(satelliteVersion) && compare(satelliteVersion, requiredMinVersion) >= 0;
};
