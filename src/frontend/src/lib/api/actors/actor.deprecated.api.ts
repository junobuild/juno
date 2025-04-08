import type { _SERVICE as MissionControlActor0013 } from '$declarations/deprecated/mission_control-0-0-13.did';
import { idlFactory as idlFactorMissionControl0013 } from '$declarations/deprecated/mission_control-0-0-13.factory.did';
import type { _SERVICE as MissionControlActor004 } from '$declarations/deprecated/mission_control-0-0-4.did';
import { idlFactory as idlFactorMissionControl004 } from '$declarations/deprecated/mission_control-0-0-4.factory.did';
import type { _SERVICE as OrbiterActor007 } from '$declarations/deprecated/orbiter-0-0-7.did';
import { idlFactory as idlFactorOrbiter007 } from '$declarations/deprecated/orbiter-0-0-7.factory.did';
import type { _SERVICE as SatelliteActor0021 } from '$declarations/deprecated/satellite-0-0-21.did';
import { idlFactory as idlFactorSatellite0021 } from '$declarations/deprecated/satellite-0-0-21.factory.did';
import type { _SERVICE as SatelliteActor008 } from '$declarations/deprecated/satellite-0-0-8.did';
import { idlFactory as idlFactorSatellite008 } from '$declarations/deprecated/satellite-0-0-8.factory.did';
import type { _SERVICE as SatelliteActor009 } from '$declarations/deprecated/satellite-0-0-9.did';
import { idlFactory as idlFactorSatellite009 } from '$declarations/deprecated/satellite-0-0-9.factory.did';
import { ActorApi } from '$lib/api/actors/actor.api';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Principal } from '@dfinity/principal';

const missionControl004Actor = new ActorApi<MissionControlActor004>();
const missionControl0013Actor = new ActorApi<MissionControlActor0013>();
const satellite008Actor = new ActorApi<SatelliteActor008>();
const satellite009Actor = new ActorApi<SatelliteActor009>();
const satellite0021Actor = new ActorApi<SatelliteActor0021>();
const orbiter007Actor = new ActorApi<OrbiterActor007>();

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
		idlFactory: idlFactorMissionControl004,
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
		idlFactory: idlFactorMissionControl0013,
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
		idlFactory: idlFactorSatellite008,
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
		idlFactory: idlFactorSatellite009,
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
		idlFactory: idlFactorSatellite0021,
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
		idlFactory: idlFactorOrbiter007,
		identity
	});
