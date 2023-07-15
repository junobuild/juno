import type { _SERVICE as ConsoleActor, MissionControl } from '$declarations/console/console.did';
import type {
	_SERVICE as MissionControlActor,
	Satellite
} from '$declarations/mission_control/mission_control.did';
import {
	addMissionControlController,
	addSatellitesController,
	missionControlVersion,
	setMissionControlController,
	setSatelliteMetadata,
	setSatellitesController
} from '$lib/api/mission-control.api';
import { setMissionControlController004 } from '$lib/api/mission-control.deprecated.api';
import { satelliteVersion } from '$lib/api/satellites.api';
import { METADATA_KEY_NAME } from '$lib/constants/metadata.constants';
import { satellitesStore } from '$lib/stores/satellite.store';
import type { SetControllerParams } from '$lib/types/controllers';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { compare } from 'semver';
import { get } from 'svelte/store';
import { getConsoleActor, getMissionControlActor } from '../utils/actor.utils';
import { fromNullable } from '../utils/did.utils';

export interface MissionControlActorDetails {
	missionControlId: Principal | undefined;
	actor: MissionControlActor | undefined;
}

const initMissionControl = async ({
	consoleActor
}: {
	consoleActor: ConsoleActor;
}): Promise<MissionControl> => {
	const existingMissionControl: MissionControl | undefined = fromNullable<MissionControl>(
		await consoleActor.get_user_mission_control_center()
	);

	if (!existingMissionControl) {
		return await consoleActor.init_user_mission_control_center();
	}

	return existingMissionControl;
};

export const getMissionControl = async ({
	identity
}: {
	identity: Identity | undefined;
}): Promise<MissionControlActorDetails> => {
	if (!identity) {
		throw new Error('Invalid identity.');
	}

	const consoleActor = await getConsoleActor();

	const mission_control = await initMissionControl({ consoleActor });

	const missionControlId: Principal | undefined = fromNullable<Principal>(
		mission_control.mission_control_id
	);

	const actor: MissionControlActor | undefined = missionControlId
		? await getMissionControlActor(missionControlId)
		: undefined;

	return {
		missionControlId: missionControlId,
		actor
	};
};

// TODO: to be removed in next version as only supported if < v0.0.3
export const setMissionControlControllerForVersion = async ({
	missionControlId,
	controllerId,
	profile
}: {
	missionControlId: Principal;
} & SetControllerParams) => {
	const version = await missionControlVersion({ missionControlId });

	const missionControlController =
		compare(version, '0.0.3') >= 0
			? compare(version, '0.0.5') >= 0
				? setMissionControlController
				: setMissionControlController004
			: addMissionControlController;

	await missionControlController({ missionControlId, controllerId, profile, scope: 'admin' });
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
	const mapVersions = async (
		satelliteId: Principal
	): Promise<{ satelliteId: Principal; version: string }> => {
		const version = await satelliteVersion({ satelliteId });
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
						scope: 'admin'
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
						scope: 'admin'
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

	const updatedSatelitte = await setSatelliteMetadata({
		missionControlId,
		satelliteId,
		metadata: Array.from(updateData)
	});

	const satellites = get(satellitesStore);
	satellitesStore.set([...(satellites ?? []), updatedSatelitte]);
};
