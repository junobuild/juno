import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import { idlFactory as idlFactoryConsole } from '$declarations/console/console.factory.did';
import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactoryMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import type { _SERVICE as ObservatoryActor } from '$declarations/observatory/observatory.did';
import { idlFactory as idlFactoryObservatory } from '$declarations/observatory/observatory.factory.did';
import type { _SERVICE as OrbiterActor } from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactoryOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorySatellite } from '$declarations/satellite/satellite.factory.did';
import { ActorApi } from '$lib/api/actors/actor.api';
import { CONSOLE_CANISTER_ID, OBSERVATORY_CANISTER_ID } from '$lib/constants/constants';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Principal } from '@dfinity/principal';

const consoleActor = new ActorApi<ConsoleActor>();
const observatoryActor = new ActorApi<ObservatoryActor>();
const satelliteActor = new ActorApi<SatelliteActor>();
const orbiterActor = new ActorApi<OrbiterActor>();
const missionControlActor = new ActorApi<MissionControlActor>();

export const getConsoleActor = async (identity: OptionIdentity): Promise<ConsoleActor> =>
	await consoleActor.getActor({
		canisterId: CONSOLE_CANISTER_ID,
		idlFactory: idlFactoryConsole,
		identity
	});

export const getObservatoryActor = async (identity: OptionIdentity): Promise<ObservatoryActor> =>
	await observatoryActor.getActor({
		canisterId: OBSERVATORY_CANISTER_ID,
		idlFactory: idlFactoryObservatory,
		identity
	});

export const getSatelliteActor = async ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<SatelliteActor> =>
	await satelliteActor.getActor({
		canisterId: satelliteId,
		idlFactory: idlFactorySatellite,
		identity
	});

export const getOrbiterActor = async ({
	orbiterId,
	identity
}: {
	orbiterId: Principal;
	identity: OptionIdentity;
}): Promise<OrbiterActor> =>
	await orbiterActor.getActor({
		canisterId: orbiterId,
		idlFactory: idlFactoryOrbiter,
		identity
	});

export const getMissionControlActor = async ({
	identity,
	missionControlId
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
}): Promise<MissionControlActor> =>
	await missionControlActor.getActor({
		canisterId: missionControlId,
		idlFactory: idlFactoryMissionControl,
		identity
	});
