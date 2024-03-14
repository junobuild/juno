import type { Satellite } from '$declarations/mission_control/mission_control.did';
import {
	addMissionControlController,
	addSatellitesController,
	missionControlVersion,
	setMissionControlController,
	setOrbiter,
	setSatelliteMetadata,
	setSatellitesController
} from '$lib/api/mission-control.api';
import { setMissionControlController004 } from '$lib/api/mission-control.deprecated.api';
import { satelliteVersion } from '$lib/api/satellites.api';
import { METADATA_KEY_NAME } from '$lib/constants/metadata.constants';
import { authStore } from '$lib/stores/auth.store';
import { orbitersStore } from '$lib/stores/orbiter.store';
import { satellitesStore } from '$lib/stores/satellite.store';
import type { SetControllerParams } from '$lib/types/controllers';
import type { Principal } from '@dfinity/principal';
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
		compare(version, '0.0.3') >= 0
			? compare(version, '0.0.5') >= 0
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
			if (compare(version, '0.0.7') >= 0) {
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
	satellitesStore.set([
		...(satellites ?? []).filter(
			({ satellite_id }) => updatedSatellite.satellite_id.toText() !== satellite_id.toText()
		),
		updatedSatellite
	]);
};

export const attachOrbiter = async (params: {
	missionControlId: Principal;
	orbiterId: Principal;
}) => {
	const identity = get(authStore).identity;

	const orbiter = await setOrbiter({ ...params, identity });

	orbitersStore.set([orbiter]);
};
