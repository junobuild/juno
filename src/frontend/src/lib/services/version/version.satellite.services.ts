import { satelliteBuildVersion, satelliteVersion } from '$lib/api/satellites.deprecated.api';
import { getNewestReleasesMetadata } from '$lib/rest/cdn.rest';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import { type SatelliteVersionMetadata, versionStore } from '$lib/stores/version.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import { container } from '$lib/utils/juno.utils';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, nonNullish } from '@dfinity/utils';
import { findJunoPackageDependency, getJunoPackage, satelliteBuildType } from '@junobuild/admin';
import { JUNO_PACKAGE_SATELLITE_ID } from '@junobuild/config';
import { get } from 'svelte/store';

export const loadSatelliteVersion = async ({
	satelliteId,
	skipReload,
	identity
}: {
	satelliteId: Principal;
	missionControlId: MissionControlId;
	skipReload: boolean;
	identity: OptionIdentity;
}) => {
	// We load the satellite version once per session
	const store = get(versionStore);
	if (nonNullish(store.satellites[satelliteId.toText()]) && skipReload) {
		return;
	}

	try {
		// Optional for convenience reasons. A guard prevent the usage of the service while not being sign-in.
		assertNonNullish(identity);

		const satelliteInfo = async (): Promise<
			Omit<SatelliteVersionMetadata, 'release'> | undefined
		> => {
			// Backwards compatibility for Satellite <= 0.0.14 which did not expose the end point "version_build"
			/**
			 * @deprecated - Replaced in Satellite > v0.0.22 with public custom section juno:package
			 */
			const queryBuildVersion = async (): Promise<string | undefined> => {
				try {
					return await satelliteBuildVersion({ satelliteId, identity });
				} catch (_: unknown) {
					return undefined;
				}
			};

			const [junoPkg] = await Promise.allSettled([
				getJunoPackage({
					moduleId: satelliteId,
					identity,
					...container()
				})
			]);

			if (junoPkg.status === 'fulfilled' && nonNullish(junoPkg.value)) {
				const pkg = junoPkg.value;
				const { name, dependencies, version } = pkg;

				// It's stock
				if (name === JUNO_PACKAGE_SATELLITE_ID) {
					return {
						current: version,
						pkg,
						build: 'stock'
					};
				}

				const satelliteDependency = findJunoPackageDependency({
					dependencies,
					dependencyId: JUNO_PACKAGE_SATELLITE_ID
				});

				if (isNullish(satelliteDependency)) {
					toasts.error({
						text: get(i18n).errors.satellite_version_not_found
					});
					return undefined;
				}

				const [_, satelliteVersion] = satelliteDependency;

				return {
					current: satelliteVersion,
					pkg,
					build: 'extended'
				};
			}

			// Legacy way of fetch build and version information
			const [version, buildVersion, buildType] = await Promise.allSettled([
				satelliteVersion({ satelliteId, identity }),
				queryBuildVersion(),
				satelliteBuildType({
					satellite: {
						satelliteId: satelliteId.toText(),
						identity,
						...container()
					}
				})
			]);

			if (version.status === 'rejected') {
				return undefined;
			}

			const { value: current } = version;

			return {
				current,
				...(buildVersion.status === 'fulfilled' &&
					nonNullish(buildVersion.value) && { currentBuild: buildVersion.value }),
				build: buildType.status === 'fulfilled' ? (buildType.value ?? 'stock') : 'stock'
			};
		};

		const [satVersion, releases] = await Promise.all([
			satelliteInfo(),
			getNewestReleasesMetadata()
		]);

		versionStore.setSatellite({
			satelliteId: satelliteId.toText(),
			version: nonNullish(satVersion)
				? {
						release: releases.satellite,
						...satVersion
					}
				: undefined
		});
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.load_version,
			detail: err
		});
	}
};
