import type { Controller } from '$declarations/mission_control/mission_control.did';
import { getMissionControl } from '$lib/services/mission-control.services';
import type { SetControllerParams } from '$lib/types/controllers';
import type { Metadata } from '$lib/types/metadata';
import { getMissionControlActor } from '$lib/utils/actor.utils';
import { toSetController } from '$lib/utils/controllers.utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

export const initMissionControl = async ({
	identity,
	onInitMissionControlSuccess
}: {
	identity: Identity;
	onInitMissionControlSuccess: (missionControlId: Principal) => Promise<void>;
}) =>
	// eslint-disable-next-line no-async-promise-executor
	new Promise<void>(async (resolve, reject) => {
		try {
			const { actor, missionControlId } = await getMissionControl({
				identity
			});

			if (!actor || !missionControlId) {
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

			await onInitMissionControlSuccess(missionControlId);

			resolve();
		} catch (err: unknown) {
			reject(err);
		}
	});

export const setSatellitesController = async ({
	missionControlId,
	satelliteIds,
	controllerId,
	...rest
}: {
	missionControlId: Principal;
	satelliteIds: Principal[];
} & SetControllerParams) => {
	try {
		const actor = await getMissionControlActor(missionControlId);
		await actor.set_satellites_controllers(
			satelliteIds,
			[Principal.fromText(controllerId)],
			toSetController(rest)
		);
	} catch (err: unknown) {
		console.error(
			'setSatellitesController:',
			missionControlId.toText(),
			satelliteIds.map((id) => id.toText()).join(',')
		);
		throw err;
	}
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
	await actor.del_satellites_controllers(satelliteIds, [controller]);
};

export const setMissionControlController = async ({
	missionControlId,
	controllerId,
	...rest
}: {
	missionControlId: Principal;
} & SetControllerParams) => {
	try {
		const actor = await getMissionControlActor(missionControlId);
		await actor.set_mission_control_controllers(
			[Principal.fromText(controllerId)],
			toSetController(rest)
		);
	} catch (err: unknown) {
		console.error('setMissionControlController:', missionControlId.toText());
		throw err;
	}
};

export const deleteMissionControlController = async ({
	missionControlId,
	controller
}: {
	missionControlId: Principal;
	controller: Principal;
}) => {
	const actor = await getMissionControlActor(missionControlId);
	await actor.del_mission_control_controllers([controller]);
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
	try {
		const actor = await getMissionControlActor(missionControlId);
		await actor.add_satellites_controllers(satelliteIds, [Principal.fromText(controllerId)]);
	} catch (err: unknown) {
		console.error(
			'addSatellitesController:',
			missionControlId.toText(),
			satelliteIds.map((id) => id.toText()).join(',')
		);
		throw err;
	}
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
	await actor.remove_satellites_controllers(satelliteIds, [controller]);
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
	try {
		const actor = await getMissionControlActor(missionControlId);
		await actor.add_mission_control_controllers([Principal.fromText(controllerId)]);
	} catch (err: unknown) {
		console.error('addMissionControlController:', missionControlId.toText());
		throw err;
	}
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
	await actor.remove_mission_control_controllers([controller]);
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
	await actor.top_up(canisterId, { e8s });
};

export const missionControlVersion = async ({
	missionControlId
}: {
	missionControlId: Principal;
}): Promise<string> => {
	const actor = await getMissionControlActor(missionControlId);
	return actor.version();
};

export const setSatelliteMetadata = async ({
	missionControlId,
	satelliteId,
	metadata
}: {
	missionControlId: Principal;
	satelliteId: Principal;
	metadata: Metadata;
}) => {
	const actor = await getMissionControlActor(missionControlId);
	await actor.set_satellite_metadata(satelliteId, metadata);
};
