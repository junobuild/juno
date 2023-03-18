import type { MissionControl, _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import type { SetControllerParams } from '$lib/api/mission-control.api';
import {
	addMissionControlController,
	addSatellitesController,
	missionControlVersion,
	setMissionControlController,
	setSatellitesController
} from '$lib/api/mission-control.api';
import { satelliteVersion } from '$lib/api/satellites.api';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { compare } from 'semver';
import { getConsoleActor, getMissionControlActor } from '../utils/actor.utils';
import { fromNullable, toNullable } from '../utils/did.utils';

export interface MissionControlActorDetails {
	missionControlId: Principal | undefined;
	actor: MissionControlActor | undefined;
}

const initMissionControl = async ({
	consoleActor,
	invitationCode
}: {
	consoleActor: ConsoleActor;
	invitationCode: string | undefined | null;
}): Promise<MissionControl> => {
	const existingMissionControl: MissionControl | undefined = fromNullable<MissionControl>(
		await consoleActor.get_user_mission_control_center()
	);

	if (!existingMissionControl) {
		return await consoleActor.init_user_mission_control_center(toNullable(invitationCode));
	}

	return existingMissionControl;
};

export const getMissionControl = async ({
	identity,
	invitationCode
}: {
	identity: Identity | undefined;
	invitationCode: string | undefined | null;
}): Promise<MissionControlActorDetails> => {
	if (!identity) {
		throw new Error('Invalid identity.');
	}

	const consoleActor = await getConsoleActor();

	const mission_control = await initMissionControl({ consoleActor, invitationCode });

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
	controllerName
}: {
	missionControlId: Principal;
} & SetControllerParams) => {
	const version = await missionControlVersion({ missionControlId });

	const missionControlController =
		compare(version, '0.0.3') >= 0 ? setMissionControlController : addMissionControlController;

	await missionControlController({ missionControlId, controllerId, controllerName });
};

// TODO: to be removed in next version as only supported if < v0.0.7
export const setSatellitesForVersion = async ({
	missionControlId,
	satelliteIds,
	controllerId,
	controllerName
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
			console.log(version, compare(version, '0.0.7'));

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

	console.log(setSatelliteIds, addSatellitesIds);

	await Promise.all([
		...(setSatelliteIds.length > 0
			? [
					setSatellitesController({
						satelliteIds: setSatelliteIds,
						missionControlId,
						controllerId,
						controllerName
					})
			  ]
			: []),
		...(addSatellitesIds.length > 0
			? [
					addSatellitesController({
						satelliteIds: addSatellitesIds,
						missionControlId,
						controllerId,
						controllerName
					})
			  ]
			: [])
	]);
};
