import type { SetController as SetControllerDid } from '$declarations/deprecated/mission_control-0-0-4.did';
import type { SetControllerParams } from '$lib/types/controllers';
import { getMissionControlActor004 } from '$lib/utils/actor.deprecated.utils';
import { toNullable } from '$lib/utils/did.utils';
import { nonNullish } from '$lib/utils/utils';
import { Principal } from '@dfinity/principal';

const toSetController = ({
	profile,
	scope
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
	...rest
}: {
	missionControlId: Principal;
} & SetControllerParams) => {
	const actor = await getMissionControlActor004(missionControlId);
	return actor.set_mission_control_controllers(
		[Principal.fromText(controllerId)],
		toSetController(rest)
	);
};

