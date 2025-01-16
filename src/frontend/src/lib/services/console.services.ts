import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import { initMissionControl as initMissionControlApi } from '$lib/api/console.api';
import { missionControlVersion } from '$lib/api/mission-control.api';
import { orbiterVersion } from '$lib/api/orbiter.api';
import { satelliteBuildVersion, satelliteVersion } from '$lib/api/satellites.api';
import { getNewestReleasesMetadata } from '$lib/rest/cdn.rest';
import { authStore } from '$lib/stores/auth.store';
import { toasts } from '$lib/stores/toasts.store';
import { versionStore, type ReleaseVersionSatellite } from '$lib/stores/version.store';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Option } from '$lib/types/utils';
import { container } from '$lib/utils/juno.utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable, isNullish, nonNullish } from '@dfinity/utils';
import { satelliteBuildType } from '@junobuild/admin';
import { get } from 'svelte/store';

export const initMissionControl = async ({
	identity,
	onInitMissionControlSuccess
}: {
	identity: Identity;
	onInitMissionControlSuccess: (missionControlId: MissionControlId) => void;
	// eslint-disable-next-line no-async-promise-executor, require-await
}) =>
	// eslint-disable-next-line no-async-promise-executor, require-await
	new Promise<void>(async (resolve, reject) => {
		try {
			const { missionControlId } = await getMissionControl({
				identity
			});

			if (isNullish(missionControlId)) {
				setTimeout(async () => {
					try {
						await initMissionControl({ identity, onInitMissionControlSuccess });
						resolve();
					} catch (err: unknown) {
						reject(err);
					}
				}, 2000);
				return;
			}

			onInitMissionControlSuccess(missionControlId);

			resolve();
		} catch (err: unknown) {
			reject(err);
		}
	});

const getMissionControl = async ({
	identity
}: {
	identity: Identity | undefined;
}): Promise<{
	missionControlId: MissionControlId | undefined;
}> => {
	if (isNullish(identity)) {
		throw new Error('Invalid identity.');
	}

	const mission_control = await initMissionControlApi(identity);

	const missionControlId: MissionControlId | undefined = fromNullable<Principal>(
		mission_control.mission_control_id
	);

	return {
		missionControlId
	};
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
		): Promise<Omit<ReleaseVersionSatellite, 'release'> | undefined> => {
			// Backwards compatibility for Satellite <= 0.0.14 which did not expose the end point "version_build"
			const queryBuildVersion = async (): Promise<string | undefined> => {
				try {
					return await satelliteBuildVersion({ satelliteId, identity });
				} catch (_: unknown) {
					return undefined;
				}
			};

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

		const [satVersion, ctrlVersion, releases] = await Promise.all([
			nonNullish(satelliteId) ? satelliteInfo(satelliteId) : empty(),
			missionControlVersion({ missionControlId, identity }),
			getNewestReleasesMetadata()
		]);

		versionStore.setMissionControl({
			release: releases.mission_control,
			current: ctrlVersion
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

	const [orbVersion, releases] = await Promise.all([
		orbiterVersion({ orbiterId: orbiter.orbiter_id, identity }),
		getNewestReleasesMetadata()
	]);

	versionStore.setOrbiter({
		release: releases.orbiter,
		current: orbVersion
	});
};
