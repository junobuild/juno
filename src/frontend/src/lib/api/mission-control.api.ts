import type { Controller, Satellite } from '$declarations/mission_control/mission_control.did';
import type { SetControllerParams } from '$lib/types/controllers';
import type { Metadata } from '$lib/types/metadata';
import { getMissionControlActor } from '$lib/utils/actor.juno.utils';
import { toSetController } from '$lib/utils/controllers.utils';
import { Principal } from '@dfinity/principal';

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
}): Promise<Satellite> => {
	const actor = await getMissionControlActor(missionControlId);
	return actor.set_satellite_metadata(satelliteId, metadata);
};

export const setOrbitersController = async ({
	missionControlId,
	orbiterIds,
	controllerId,
	...rest
}: {
	missionControlId: Principal;
	orbiterIds: Principal[];
} & SetControllerParams) => {
	try {
		const actor = await getMissionControlActor(missionControlId);
		await actor.set_orbiters_controllers(
			orbiterIds,
			[Principal.fromText(controllerId)],
			toSetController(rest)
		);
	} catch (err: unknown) {
		console.error(
			'setOrbitersController:',
			missionControlId.toText(),
			orbiterIds.map((id) => id.toText()).join(',')
		);
		throw err;
	}
};

export const deleteOrbitersController = async ({
	missionControlId,
	orbiterIds,
	controller
}: {
	missionControlId: Principal;
	orbiterIds: Principal[];
	controller: Principal;
}) => {
	const actor = await getMissionControlActor(missionControlId);
	await actor.del_orbiters_controllers(orbiterIds, [controller]);
};

export const deleteSatellite = async ({
	missionControlId,
	satelliteId,
	cyclesToDeposit
}: {
	missionControlId: Principal;
	satelliteId: Principal;
	cyclesToDeposit: bigint;
}) => {
	console.log(cyclesToDeposit);

	const { del_satellite } = await getMissionControlActor(missionControlId);
	await del_satellite(satelliteId, cyclesToDeposit);
};

export const deleteOrbiter = async ({
	missionControlId,
	orbiterId,
	cyclesToDeposit
}: {
	missionControlId: Principal;
	orbiterId: Principal;
	cyclesToDeposit: bigint;
}) => {
	const { del_orbiter } = await getMissionControlActor(missionControlId);
	await del_orbiter(orbiterId, cyclesToDeposit);
};

export const depositCycles = async ({
	missionControlId,
	cycles,
	destinationId: destination_id
}: {
	missionControlId: Principal;
	cycles: bigint;
	destinationId: Principal;
}) => {
	const { deposit_cycles } = await getMissionControlActor(missionControlId);
	return deposit_cycles({
		cycles,
		destination_id
	});
};
