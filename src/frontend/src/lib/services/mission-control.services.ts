import type { MissionControl, _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
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
