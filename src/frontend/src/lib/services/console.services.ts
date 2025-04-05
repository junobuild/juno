import type { MissionControl } from '$declarations/console/console.did';
import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import {
	getMissionControl as getMissionControlApi,
	initMissionControl as initMissionControlApi
} from '$lib/api/console.api';
import { missionControlVersion } from '$lib/api/mission-control.api';
import { orbiterVersion } from '$lib/api/orbiter.api';
import { satelliteBuildVersion, satelliteVersion } from '$lib/api/satellites.api';
import { getNewestReleasesMetadata } from '$lib/rest/cdn.rest';
import { missionControlErrorSignOut } from '$lib/services/auth.services';
import { authStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import { missionControlIdCertifiedStore } from '$lib/stores/mission-control.store';
import { toasts } from '$lib/stores/toasts.store';
import {
	versionStore,
	type SatelliteVersionMetadata,
	type VersionMetadata
} from '$lib/stores/version.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Option } from '$lib/types/utils';
import { container } from '$lib/utils/juno.utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, isNullish, nonNullish } from '@dfinity/utils';
import { getJunoPackage, satelliteBuildType } from '@junobuild/admin';
import { get } from 'svelte/store';

interface Certified {
	certified: boolean;
}

type PollAndInitResult = {
	missionControlId: MissionControlId;
} & Certified;

export const initMissionControl = async ({
	identity
}: {
	identity: OptionIdentity;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	// If not signed in, we are not going to init and load a mission control.
	if (isNullish(identity)) {
		return { result: 'skip' };
	}

	try {
		// Poll to init mission control center
		const { missionControlId, certified } = await pollAndInitMissionControl({
			identity
		});

		missionControlIdCertifiedStore.set({
			data: missionControlId,
			certified
		});

		if (certified) {
			return { result: 'success' };
		}

		// We deliberately do not await the promise to avoid blocking the main UX. However, if necessary, we take the required measures if Mission Control cannot be certified.
		assertMissionControl({ identity });

		return { result: 'success' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.initializing_mission_control,
			detail: err
		});

		// There was an error so, we sign the user out otherwise skeleton and other spinners will be displayed forever
		await missionControlErrorSignOut();

		return { result: 'error' };
	}
};

const pollAndInitMissionControl = async ({
	identity
}: {
	identity: Identity;
	// eslint-disable-next-line require-await
}): Promise<PollAndInitResult> =>
	// eslint-disable-next-line no-async-promise-executor
	new Promise<PollAndInitResult>(async (resolve, reject) => {
		try {
			const { missionControlId, certified } = await getOrInitMissionControlId({
				identity
			});

			// TODO: we can/should probably add a max time to not retry forever even though the user will probably close their browsers.
			if (isNullish(missionControlId)) {
				setTimeout(async () => {
					try {
						const result = await pollAndInitMissionControl({ identity });
						resolve(result);
					} catch (err: unknown) {
						reject(err);
					}
				}, 2000);
				return;
			}

			resolve({ missionControlId, certified });
		} catch (err: unknown) {
			reject(err);
		}
	});

const getOrInitMissionControlId = async (params: {
	identity: Identity;
}): Promise<
	{
		missionControlId: MissionControlId | undefined;
	} & Certified
> => {
	const { missionControl, certified } = await getOrInitMissionControl(params);

	const missionControlId = fromNullable(missionControl.mission_control_id);

	return {
		missionControlId,
		certified
	};
};

export const getOrInitMissionControl = async ({
	identity
}: {
	identity: Identity;
}): Promise<{ missionControl: MissionControl } & Certified> => {
	const existingMissionControl = await getMissionControlApi({ identity, certified: false });

	if (isNullish(existingMissionControl)) {
		const newMissionControl = await initMissionControlApi(identity);

		return {
			missionControl: newMissionControl,
			certified: true
		};
	}

	return {
		missionControl: existingMissionControl,
		certified: false
	};
};

const assertMissionControl = async ({ identity }: { identity: Identity }) => {
	try {
		await getMissionControlApi({ identity, certified: true });
	} catch (_err: unknown) {
		await missionControlErrorSignOut();
	}
};

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
				if (name === '@junobuild/satellite') {
					return {
						current: version,
						pkg,
						build: 'stock'
					};
				}

				const satelliteDependency = Object.entries(dependencies ?? {}).find(
					([key, _]) => key === '@junobuild/satellite'
				);

				if (isNullish(satelliteDependency)) {
					// TODO: should we throw an error if the dependency Satellite is not found?
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
