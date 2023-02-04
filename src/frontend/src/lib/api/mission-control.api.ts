import type { Transaction } from '$declarations/mission_control/mission_control.did';
import { getMissionControl } from '$lib/services/mission-control.services';
import { getMissionControlActor } from '$lib/utils/actor.utils';
import { isNullish } from '$lib/utils/utils';
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

export const listTransactions = async ({
	missionControlId
}: {
	missionControlId: Principal | undefined | null;
}): Promise<Transaction[]> => {
	if (isNullish(missionControlId)) {
		return [];
	}

	const actor = await getMissionControlActor(missionControlId);
	return actor.list_transactions();
};

export const addSatellitesController = async ({
	missionControlId,
	satelliteIds,
	controller
}: {
	missionControlId: Principal;
	satelliteIds: Principal[];
	controller: string;
}) => {
	const actor = await getMissionControlActor(missionControlId);
	return actor.add_satellites_controllers(satelliteIds, [Principal.fromText(controller)]);
};

export const addMissionControlController = async ({
	missionControlId,
	controller
}: {
	missionControlId: Principal;
	controller: string;
}) => {
	const actor = await getMissionControlActor(missionControlId);
	return actor.add_mission_control_controllers([Principal.fromText(controller)]);
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
