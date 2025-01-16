import type { Result_2 } from '$declarations/deprecated/mission_control-0-0-13.did';
import type { SetController as SetControllerDid } from '$declarations/deprecated/mission_control-0-0-4.did';
import {
	getMissionControlActor0013,
	getMissionControlActor004
} from '$lib/api/actors/actor.deprecated.api';
import type { SetControllerParams } from '$lib/types/controllers';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import { Principal } from '@dfinity/principal';
import { nonNullish, toNullable } from '@dfinity/utils';

const toSetController = ({
	profile
}: Omit<SetControllerParams, 'controllerId'>): SetControllerDid => ({
	metadata: nonNullish(profile) && profile !== '' ? [['profile', profile]] : [],
	expires_at: toNullable<bigint>(undefined)
});

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const setMissionControlController004 = async ({
	missionControlId,
	controllerId,
	identity,
	...rest
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
} & SetControllerParams) => {
	try {
		const actor = await getMissionControlActor004({ missionControlId, identity });
		await actor.set_mission_control_controllers(
			[Principal.fromText(controllerId)],
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
}): Promise<[] | [[bigint, Result_2][]]> => {
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
}): Promise<[] | [[bigint, Result_2][]]> => {
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
}): Promise<[] | [[bigint, Result_2][]]> => {
	const { list_mission_control_statuses } = await getMissionControlActor0013({
		missionControlId,
		identity
	});
	return [await list_mission_control_statuses()];
};
