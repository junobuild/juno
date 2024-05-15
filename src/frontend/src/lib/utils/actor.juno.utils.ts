import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import type { _SERVICE as ObservatoryActor } from '$declarations/observatory/observatory.did';
import { idlFactory as idlFactorObservatory } from '$declarations/observatory/observatory.factory.did';
import type { _SERVICE as OrbiterActor } from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import type { OptionIdentity } from '$lib/types/itentity';
import { createActor } from '$lib/utils/actor.utils';
import type { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';
import {CONSOLE_CANISTER_ID, OBSERVATORY_CANISTER_ID} from "$lib/constants/constants";

export const getConsoleActor = async (identity: OptionIdentity): Promise<ConsoleActor> => {
	if (isNullish(identity)) {
		throw new Error('No internet identity.');
	}

	return createActor({
		canisterId: CONSOLE_CANISTER_ID,
		idlFactory: idlFactorConsole,
		identity
	});
};

export const getObservatoryActor = async (identity: OptionIdentity): Promise<ObservatoryActor> => {
	if (isNullish(identity)) {
		throw new Error('No internet identity.');
	}

	return createActor({
		canisterId: OBSERVATORY_CANISTER_ID,
		idlFactory: idlFactorObservatory,
		identity
	});
};

export const getSatelliteActor = async ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<SatelliteActor> => {
	if (isNullish(identity)) {
		throw new Error('No internet identity.');
	}

	return createActor({
		canisterId: satelliteId,
		idlFactory: idlFactorSatellite,
		identity
	});
};

export const getOrbiterActor = async ({
	orbiterId,
	identity
}: {
	orbiterId: Principal;
	identity: OptionIdentity;
}): Promise<OrbiterActor> => {
	if (isNullish(identity)) {
		throw new Error('No internet identity.');
	}

	return createActor({
		canisterId: orbiterId,
		idlFactory: idlFactorOrbiter,
		identity
	});
};

export const getMissionControlActor = async ({
	identity,
	missionControlId
}: {
	missionControlId: Principal;
	identity: OptionIdentity;
}): Promise<MissionControlActor> => {
	if (isNullish(identity)) {
		throw new Error('No internet identity.');
	}

	return createActor({
		canisterId: missionControlId,
		idlFactory: idlFactorMissionControl,
		identity
	});
};
