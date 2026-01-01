import type { MissionControlDid0013, MissionControlDid004 } from '$declarations';
import {
	getMissionControlActor0013,
	getMissionControlActor004
} from '$lib/api/actors/actor.deprecated.api';
import type { AddAccessKeyParams } from '$lib/types/access-keys';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import { nonNullish, toNullable } from '@dfinity/utils';
import { Principal } from '@icp-sdk/core/principal';

const toSetController = ({
	profile
}: Omit<AddAccessKeyParams, 'accessKeyId'>): MissionControlDid004.SetController => ({
	metadata: nonNullish(profile) && profile !== '' ? [['profile', profile]] : [],
	expires_at: toNullable<bigint>(undefined)
});

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const setMissionControlController004 = async ({
	missionControlId,
	accessKeyId,
	identity,
	...rest
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
} & AddAccessKeyParams) => {
	try {
		const actor = await getMissionControlActor004({ missionControlId, identity });
		await actor.set_mission_control_controllers(
			[Principal.from(accessKeyId)],
			toSetController(rest)
		);
	} catch (err: unknown) {
		console.error('setMissionControlController004:', missionControlId.toText());
		throw err;
	}
};

/**
 * @deprecated
 */
export const listSatelliteStatuses = async ({
	missionControlId,
	identity,
	satelliteId
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
	satelliteId: Principal;
}): Promise<[] | [[bigint, MissionControlDid0013.Result_2][]]> => {
	const { list_satellite_statuses } = await getMissionControlActor0013({
		missionControlId,
		identity
	});
	return list_satellite_statuses(satelliteId);
};

/**
 * @deprecated
 */
export const listOrbiterStatuses = async ({
	missionControlId,
	identity,
	orbiterId
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
	orbiterId: Principal;
}): Promise<[] | [[bigint, MissionControlDid0013.Result_2][]]> => {
	const { list_orbiter_statuses } = await getMissionControlActor0013({
		missionControlId,
		identity
	});
	return list_orbiter_statuses(orbiterId);
};

/**
 * @deprecated
 */
export const listMissionControlStatuses = async ({
	missionControlId,
	identity
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
}): Promise<[] | [[bigint, MissionControlDid0013.Result_2][]]> => {
	const { list_mission_control_statuses } = await getMissionControlActor0013({
		missionControlId,
		identity
	});
	return [await list_mission_control_statuses()];
};

/**
 * @deprecated - Replaced in Mission Control > v0.0.14 with public custom section juno:package
 */
export const missionControlVersion = async ({
	missionControlId,
	identity
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
}): Promise<string> => {
	const { version } = await getMissionControlActor0013({ missionControlId, identity });
	return version();
};

/**
 * @deprecated use setSatellitesController
 */
export const addSatellitesController003 = async ({
	missionControlId,
	satelliteIds,
	accessKeyId,
	identity
}: {
	missionControlId: MissionControlId;
	satelliteIds: Principal[];
	identity: OptionIdentity;
} & AddAccessKeyParams) => {
	try {
		// We use getMissionControlActor004 actor because the method add_satellites_controllers
		// was ultimately deprecated (removed) in Mission Control v0.2.0
		const { add_satellites_controllers } = await getMissionControlActor004({
			missionControlId,
			identity
		});
		await add_satellites_controllers(satelliteIds, [Principal.from(accessKeyId)]);
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
 * @deprecated use setMissionControlController
 */
export const addMissionControlController003 = async ({
	missionControlId,
	accessKeyId,
	identity
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
} & AddAccessKeyParams) => {
	try {
		// We use getMissionControlActor004 actor because the method add_mission_control_controllers
		// was ultimately deprecated (removed) in Mission Control v0.2.0
		const { add_mission_control_controllers } = await getMissionControlActor004({
			missionControlId,
			identity
		});
		await add_mission_control_controllers([Principal.from(accessKeyId)]);
	} catch (err: unknown) {
		console.error('addMissionControlController:', missionControlId.toText());
		throw err;
	}
};
