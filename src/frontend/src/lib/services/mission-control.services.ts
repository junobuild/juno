import type { Satellite } from '$declarations/mission_control/mission_control.did';
import {
	addMissionControlController,
	addSatellitesController,
	getSettings,
	missionControlVersion,
	setMissionControlController,
	setOrbiter,
	setSatellite,
	setSatelliteMetadata,
	setSatellitesController,
	unsetOrbiter,
	unsetSatellite
} from '$lib/api/mission-control.api';
import { setMissionControlController004 } from '$lib/api/mission-control.deprecated.api';
import { satelliteVersion } from '$lib/api/satellites.api';
import { METADATA_KEY_NAME } from '$lib/constants/metadata.constants';
import {
	MISSION_CONTROL_v0_0_3,
	MISSION_CONTROL_v0_0_5,
	MISSION_CONTROL_v0_0_7
} from '$lib/constants/version.constants';
import { satellitesStore } from '$lib/derived/satellite.derived';
import { loadSatellites } from '$lib/services/satellites.services';
import { authStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import { missionControlSettingsDataStore } from '$lib/stores/mission-control.store';
import { orbitersDataStore } from '$lib/stores/orbiter.store';
import { satellitesDataStore } from '$lib/stores/satellite.store';
import { toasts } from '$lib/stores/toasts.store';
import type { SetControllerParams } from '$lib/types/controllers';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullable } from '@dfinity/utils';
import { compare } from 'semver';
import { get } from 'svelte/store';

// TODO: to be removed in next version as only supported if < v0.0.3
export const setMissionControlControllerForVersion = async ({
	missionControlId,
	controllerId,
	profile
}: {
	missionControlId: Principal;
} & SetControllerParams) => {
	const identity = get(authStore).identity;

	const version = await missionControlVersion({ missionControlId, identity });

	const missionControlController =
		compare(version, MISSION_CONTROL_v0_0_3) >= 0
			? compare(version, MISSION_CONTROL_v0_0_5) >= 0
				? setMissionControlController
				: setMissionControlController004
			: addMissionControlController;

	await missionControlController({
		missionControlId,
		controllerId,
		profile,
		scope: 'admin',
		identity
	});
};

// TODO: to be removed in next version as only supported if < v0.0.7
export const setSatellitesForVersion = async ({
	missionControlId,
	satelliteIds,
	controllerId,
	profile
}: {
	missionControlId: Principal;
	satelliteIds: Principal[];
} & SetControllerParams) => {
	const identity = get(authStore).identity;

	const mapVersions = async (
		satelliteId: Principal
	): Promise<{ satelliteId: Principal; version: string }> => {
		const version = await satelliteVersion({ satelliteId, identity });
		return {
			version,
			satelliteId
		};
	};

	const versions = await Promise.all(satelliteIds.map(mapVersions));

	const { setSatelliteIds, addSatellitesIds } = versions.reduce(
		(
			{
				setSatelliteIds,
				addSatellitesIds
			}: { setSatelliteIds: Principal[]; addSatellitesIds: Principal[] },
			{ satelliteId, version }
		) => {
			if (compare(version, MISSION_CONTROL_v0_0_7) >= 0) {
				return {
					setSatelliteIds: [...setSatelliteIds, satelliteId],
					addSatellitesIds
				};
			}

			return {
				setSatelliteIds,
				addSatellitesIds: [...addSatellitesIds, satelliteId]
			};
		},
		{ setSatelliteIds: [], addSatellitesIds: [] }
	);

	await Promise.all([
		...(setSatelliteIds.length > 0
			? [
					setSatellitesController({
						satelliteIds: setSatelliteIds,
						missionControlId,
						controllerId,
						profile,
						scope: 'admin',
						identity
					})
				]
			: []),
		...(addSatellitesIds.length > 0
			? [
					addSatellitesController({
						satelliteIds: addSatellitesIds,
						missionControlId,
						controllerId,
						profile,
						scope: 'admin',
						identity
					})
				]
			: [])
	]);
};

export const setSatelliteName = async ({
	missionControlId,
	satellite: { satellite_id: satelliteId, metadata },
	satelliteName
}: {
	missionControlId: Principal;
	satellite: Satellite;
	satelliteName: string;
}) => {
	const updateData = new Map(metadata);
	updateData.set(METADATA_KEY_NAME, satelliteName);

	const identity = get(authStore).identity;

	const updatedSatellite = await setSatelliteMetadata({
		missionControlId,
		satelliteId,
		metadata: Array.from(updateData),
		identity
	});

	const satellites = get(satellitesStore);
	satellitesDataStore.set([
		...(satellites ?? []).filter(
			({ satellite_id }) => updatedSatellite.satellite_id.toText() !== satellite_id.toText()
		),
		updatedSatellite
	]);
};

export const attachSatellite = async ({
	missionControlId,
	satelliteId
}: {
	missionControlId: Principal;
	satelliteId: Principal;
}) => {
	const identity = get(authStore).identity;

	await setSatellite({ missionControlId, satelliteId, identity });

	// We reload all satellites because if the developer accesses the mission control page directly, the satellites may not be loaded. Adding just one satellite could give the user the impression that there is an issue.
	await loadSatellites({
		missionControl: missionControlId,
		reload: true
	});
};

export const detachSatellite = async ({
	canisterId,
	missionControlId
}: {
	missionControlId: Principal;
	canisterId: Principal;
}) => {
	const identity = get(authStore).identity;

	await unsetSatellite({ missionControlId, satelliteId: canisterId, identity });

	await loadSatellites({
		missionControl: missionControlId,
		reload: true
	});
};

export const attachOrbiter = async (params: {
	missionControlId: Principal;
	orbiterId: Principal;
}) => {
	const identity = get(authStore).identity;

	const orbiter = await setOrbiter({ ...params, identity });

	orbitersDataStore.set([orbiter]);
};

export const detachOrbiter = async ({
	canisterId,
	...rest
}: {
	missionControlId: Principal;
	canisterId: Principal;
}) => {
	const identity = get(authStore).identity;

	await unsetOrbiter({ ...rest, orbiterId: canisterId, identity });

	orbitersDataStore.reset();
};

export const loadSettings = async ({
	missionControl: missionControlId,
	identity,
	reload = false
}: {
	missionControl: Principal;
	identity: OptionIdentity;
	reload?: boolean;
}): Promise<{ success: boolean }> => {
	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		const store = get(missionControlSettingsDataStore);

		if (store !== undefined && !reload) {
			return { success: true };
		}

		const settings = await getSettings({
			missionControlId,
			identity
		});

		missionControlSettingsDataStore.set(fromNullable(settings));

		return { success: true };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.snapshot_loading_errors,
			detail: err
		});

		missionControlSettingsDataStore.reset();

		return { success: false };
	}
};
