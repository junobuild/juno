import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import { missionControlVersion } from '$lib/api/mission-control.deprecated.api';
import { orbiterVersion } from '$lib/api/orbiter.deprecated.api';
import { satelliteBuildVersion, satelliteVersion } from '$lib/api/satellites.api';
import { getNewestReleasesMetadata } from '$lib/rest/cdn.rest';
import { authStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import {
	type SatelliteVersionMetadata,
	type VersionMetadata,
	versionStore
} from '$lib/stores/version.store';
import type { Option } from '$lib/types/utils';
import { container } from '$lib/utils/juno.utils';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, nonNullish } from '@dfinity/utils';
import { findJunoPackageDependency, getJunoPackage, satelliteBuildType } from '@junobuild/admin';
import { JUNO_PACKAGE_SATELLITE_ID } from '@junobuild/config';
import { get } from 'svelte/store';

export const loadVersion = async ({
	satelliteId,
	missionControlId,
	skipReload
}: {
	satelliteId: Principal | undefined;
	missionControlId: Option<Principal>;
	skipReload: boolean;
}) => {
	if (isNullish(missionControlId)) {
		return;
	}

	// We load the satellite version once per session
	// We might load the mission control version twice per session if user go to that view first and then to overview
	const store = get(versionStore);
	if (nonNullish(satelliteId) && nonNullish(store.satellites[satelliteId.toText()]) && skipReload) {
		return;
	}

	try {
		const empty = (): Promise<undefined> => Promise.resolve(undefined);

		const identity = get(authStore).identity;

		assertNonNullish(identity);

		const satelliteInfo = async (
			satelliteId: Principal
		): Promise<Omit<SatelliteVersionMetadata, 'release'> | undefined> => {
			// Backwards compatibility for Satellite <= 0.0.14 which did not expose the end point "version_build"
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

		const missionControlInfo = async (
			missionControlId: Principal
		): Promise<Omit<VersionMetadata, 'release'>> => {
			const [junoPkg] = await Promise.allSettled([
				getJunoPackage({
					moduleId: missionControlId,
					identity,
					...container()
				})
			]);

			if (junoPkg.status === 'fulfilled' && nonNullish(junoPkg.value)) {
				const pkg = junoPkg.value;
				const { version } = pkg;

				return {
					current: version,
					pkg
				};
			}

			// Legacy way of fetch build and version information
			const version = await missionControlVersion({ missionControlId, identity });

			return {
				current: version
			};
		};

		const [satVersion, ctrlVersion, releases] = await Promise.all([
			nonNullish(satelliteId) ? satelliteInfo(satelliteId) : empty(),
			missionControlInfo(missionControlId),
			getNewestReleasesMetadata()
		]);

		versionStore.setMissionControl({
			release: releases.mission_control,
			...ctrlVersion
		});

		if (isNullish(satelliteId)) {
			return;
		}

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
			text: `Cannot fetch the versions information.`,
			detail: err
		});
	}
};

export const loadOrbiterVersion = async ({
	orbiter,
	reload
}: {
	orbiter: Option<Orbiter>;
	reload: boolean;
}) => {
	if (isNullish(orbiter)) {
		return;
	}

	// We load the orbiter version once per session
	const store = get(versionStore);
	if (nonNullish(store.orbiter) && !reload) {
		return;
	}

	const identity = get(authStore).identity;

	assertNonNullish(identity);

	const orbiterInfo = async (orbiterId: Principal): Promise<Omit<VersionMetadata, 'release'>> => {
		const [junoPkg] = await Promise.allSettled([
			getJunoPackage({
				moduleId: orbiterId,
				identity,
				...container()
			})
		]);

		if (junoPkg.status === 'fulfilled' && nonNullish(junoPkg.value)) {
			const pkg = junoPkg.value;
			const { version } = pkg;

			return {
				current: version,
				pkg
			};
		}

		// Legacy way of fetch build and version information
		const version = await orbiterVersion({ orbiterId, identity });

		return {
			current: version
		};
	};

	const [orbVersion, releases] = await Promise.all([
		orbiterInfo(orbiter.orbiter_id),
		getNewestReleasesMetadata()
	]);

	versionStore.setOrbiter({
		release: releases.orbiter,
		...orbVersion
	});
};
