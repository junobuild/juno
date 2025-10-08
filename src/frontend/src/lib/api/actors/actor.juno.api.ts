import {
	type ConsoleActor,
	type MissionControlActor,
	type ObservatoryActor,
	type OrbiterActor,
	type SatelliteActor,
	idlFactoryCertifiedConsole,
	idlFactoryConsole,
	idlFactoryMissionControl,
	idlFactoryObservatory,
	idlFactoryOrbiter,
	idlFactorySatellite
} from '$declarations';
import { ActorApi, type GetActorParams } from '$lib/api/actors/actor.api';
import { CONSOLE_CANISTER_ID, OBSERVATORY_CANISTER_ID } from '$lib/constants/app.constants';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Principal } from '@dfinity/principal';

const consoleActor = new ActorApi<ConsoleActor>();
const observatoryActor = new ActorApi<ObservatoryActor>();
const satelliteActor = new ActorApi<SatelliteActor>();
const orbiterActor = new ActorApi<OrbiterActor>();
const missionControlActor = new ActorApi<MissionControlActor>();

export const getConsoleActor = async ({
	identity,
	certified
}: GetActorParams): Promise<ConsoleActor> =>
	await consoleActor.getActor({
		canisterId: CONSOLE_CANISTER_ID,
		idlFactory: certified ? idlFactoryCertifiedConsole : idlFactoryConsole,
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
