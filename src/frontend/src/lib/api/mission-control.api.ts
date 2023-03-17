import type { Controller, SetController } from '$declarations/mission_control/mission_control.did';
import { getMissionControl } from '$lib/services/mission-control.services';
import { getMissionControlActor } from '$lib/utils/actor.utils';
import { toNullable } from '$lib/utils/did.utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

export const initMissionControl = async ({
	identity,
	invitationCode,
	onInitMissionControlSuccess
}: {
	identity: Identity;
	invitationCode: string | undefined | null;
	onInitMissionControlSuccess: (missionControlId: Principal) => Promise<void>;
}) =>
	// eslint-disable-next-line no-async-promise-executor
	new Promise<void>(async (resolve, reject) => {
		try {
			const { actor, missionControlId } = await getMissionControl({
				identity,
				invitationCode
			});

			if (!actor || !missionControlId) {
				setTimeout(async () => {
					try {
						await initMissionControl({ identity, invitationCode, onInitMissionControlSuccess });
						resolve();
					} catch (err: unknown) {
						reject(err);
					}
				}, 2000);
				return;
			}

			await onInitMissionControlSuccess(missionControlId);

			resolve();
		} catch (err: unknown) {
			reject(err);
		}
	});

export type SetControllerParams = {
	controllerId: string;
	controllerName: string;
};

const toSetController = (controllerName: string): SetController => ({
	metadata: controllerName !== "" ? [['name', controllerName]] : [],
	expires_at: toNullable<bigint>(undefined)
});

export const setSatellitesController = async ({
	missionControlId,
	satelliteIds,
	controllerId,
	controllerName
}: {
	missionControlId: Principal;
	satelliteIds: Principal[];
} & SetControllerParams) => {
	const actor = await getMissionControlActor(missionControlId);
	return actor.set_satellites_controllers(
		satelliteIds,
		[Principal.fromText(controllerId)],
		toSetController(controllerName)
	);
};

export const deleteSatellitesController = async ({
	missionControlId,
	satelliteIds,
	controller
}: {
	missionControlId: Principal;
	satelliteIds: Principal[];
	controller: Principal;
}) => {
	const actor = await getMissionControlActor(missionControlId);
	return actor.del_satellites_controllers(satelliteIds, [controller]);
};

export const setMissionControlController = async ({
	missionControlId,
	controllerId,
	controllerName
}: {
	missionControlId: Principal;
} & SetControllerParams) => {
	const actor = await getMissionControlActor(missionControlId);
	return actor.set_mission_control_controllers(
		[Principal.fromText(controllerId)],
		toSetController(controllerName)
	);
};

export const deleteMissionControlController = async ({
	missionControlId,
	controller
}: {
	missionControlId: Principal;
	controller: Principal;
}) => {
	const actor = await getMissionControlActor(missionControlId);
	return actor.del_mission_control_controllers([controller]);
};

/**
 * @deprecated use setSatellitesController
 */
export const addSatellitesController = async ({
	missionControlId,
	satelliteIds,
	controllerId
}: {
	missionControlId: Principal;
	satelliteIds: Principal[];
} & SetControllerParams) => {
	const actor = await getMissionControlActor(missionControlId);
	return actor.add_satellites_controllers(satelliteIds, [Principal.fromText(controllerId)]);
};

/**
 * @deprecated use deleteSatellitesController
 */
export const removeSatellitesController = async ({
	missionControlId,
	satelliteIds,
	controller
}: {
	missionControlId: Principal;
	satelliteIds: Principal[];
	controller: Principal;
}) => {
	const actor = await getMissionControlActor(missionControlId);
	return actor.remove_satellites_controllers(satelliteIds, [controller]);
};

/**
 * @deprecated use setMissionControlController
 */
export const addMissionControlController = async ({
	missionControlId,
	controllerId
}: {
	missionControlId: Principal;
} & SetControllerParams) => {
	const actor = await getMissionControlActor(missionControlId);
	return actor.add_mission_control_controllers([Principal.fromText(controllerId)]);
};

/**
 * @deprecated use deleteMissionControlController
 */
export const removeMissionControlController = async ({
	missionControlId,
	controller
}: {
	missionControlId: Principal;
	controller: Principal;
}) => {
	const actor = await getMissionControlActor(missionControlId);
	return actor.remove_mission_control_controllers([controller]);
};

export const listMissionControlControllers = async ({
	missionControlId
}: {
	missionControlId: Principal;
}): Promise<[Principal, Controller][]> => {
	const actor = await getMissionControlActor(missionControlId);
	return actor.list_mission_control_controllers();
};

export const topUp = async ({
	missionControlId,
	canisterId,
	e8s
}: {
	missionControlId: Principal;
	canisterId: Principal;
	e8s: bigint;
}) => {
	const actor = await getMissionControlActor(missionControlId);
	return actor.top_up(canisterId, { e8s });
};

export const missionControlVersion = async ({
	missionControlId
}: {
	missionControlId: Principal;
}): Promise<string> => {
	const actor = await getMissionControlActor(missionControlId);
	return actor.version();
};
