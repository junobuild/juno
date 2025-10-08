import { ActorApi } from '$lib/api/actors/actor.api';
import {
	type MissionControlActor0013,
	type MissionControlActor004,
	type OrbiterActor007,
	type OrbiterActor008,
	type SatelliteActor0021,
	type SatelliteActor0022,
	type SatelliteActor008,
	type SatelliteActor009,
	idlFactoryMissionControl0013,
	idlFactoryMissionControl004,
	idlFactoryOrbiter007,
	idlFactoryOrbiter008,
	idlFactorySatellite0021,
	idlFactorySatellite0022,
	idlFactorySatellite008,
	idlFactorySatellite009
} from '$lib/api/actors/actor.factory';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Principal } from '@dfinity/principal';

const missionControl004Actor = new ActorApi<MissionControlActor004>();
const missionControl0013Actor = new ActorApi<MissionControlActor0013>();
const satellite008Actor = new ActorApi<SatelliteActor008>();
const satellite009Actor = new ActorApi<SatelliteActor009>();
const satellite0021Actor = new ActorApi<SatelliteActor0021>();
const satellite0022Actor = new ActorApi<SatelliteActor0022>();
const orbiter007Actor = new ActorApi<OrbiterActor007>();
const orbiter008Actor = new ActorApi<OrbiterActor008>();

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const getMissionControlActor004 = ({
	identity,
	missionControlId
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
}): Promise<MissionControlActor004> =>
	missionControl004Actor.getActor({
		canisterId: missionControlId,
		idlFactory: idlFactoryMissionControl004,
		identity
	});

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const getMissionControlActor0013 = ({
	identity,
	missionControlId
}: {
	missionControlId: MissionControlId;
	identity: OptionIdentity;
}): Promise<MissionControlActor0013> =>
	missionControl0013Actor.getActor({
		canisterId: missionControlId,
		idlFactory: idlFactoryMissionControl0013,
		identity
	});

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const getSatelliteActor008 = ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<SatelliteActor008> =>
	satellite008Actor.getActor({
		canisterId: satelliteId,
		idlFactory: idlFactorySatellite008,
		identity
	});

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const getSatelliteActor009 = ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<SatelliteActor009> =>
	satellite009Actor.getActor({
		canisterId: satelliteId,
		idlFactory: idlFactorySatellite009,
		identity
	});

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const getSatelliteActor0021 = ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<SatelliteActor0021> =>
	satellite0021Actor.getActor({
		canisterId: satelliteId,
		idlFactory: idlFactorySatellite0021,
		identity
	});

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const getSatelliteActor0022 = ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<SatelliteActor0022> =>
	satellite0022Actor.getActor({
		canisterId: satelliteId,
		idlFactory: idlFactorySatellite0022,
		identity
	});

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const getOrbiterActor007 = ({
	orbiterId,
	identity
}: {
	orbiterId: Principal;
	identity: OptionIdentity;
}): Promise<OrbiterActor007> =>
	orbiter007Actor.getActor({
		canisterId: orbiterId,
		idlFactory: idlFactoryOrbiter007,
		identity
	});

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const getOrbiterActor008 = ({
	orbiterId,
	identity
}: {
	orbiterId: Principal;
	identity: OptionIdentity;
}): Promise<OrbiterActor008> =>
	orbiter008Actor.getActor({
		canisterId: orbiterId,
		idlFactory: idlFactoryOrbiter008,
		identity
	});
