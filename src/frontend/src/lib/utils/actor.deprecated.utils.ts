import type { _SERVICE as MissionControlActor004 } from '$declarations/deprecated/mission_control-0-0-4.did';
import { idlFactory as idlFactorMissionControl004 } from '$declarations/deprecated/mission_control-0-0-4.factory.did';
import type { _SERVICE as OrbiterActor007 } from '$declarations/deprecated/orbiter-0-0-7.did';
import { idlFactory as idlFactorOrbiter007 } from '$declarations/deprecated/orbiter-0-0-7.factory.did';
import type { _SERVICE as SatelliteActor008 } from '$declarations/deprecated/satellite-0-0-8.did';
import { idlFactory as idlFactorSatellite008 } from '$declarations/deprecated/satellite-0-0-8.factory.did';
import type { _SERVICE as SatelliteActor009 } from '$declarations/deprecated/satellite-0-0-9.did';
import { idlFactory as idlFactorSatellite009 } from '$declarations/deprecated/satellite-0-0-9.factory.did';
import { authStore } from '$lib/stores/auth.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { createActor } from '$lib/utils/actor.utils';
import type { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const getMissionControlActor004 = (
	canisterId: Principal
): Promise<MissionControlActor004> => {
	const identity: OptionIdentity = get(authStore).identity;

	if (!identity) {
		throw new Error('No internet identity.');
	}

	return createActor({
		canisterId,
		idlFactory: idlFactorMissionControl004,
		identity
	});
};

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const getSatelliteActor008 = (canisterId: Principal): Promise<SatelliteActor008> => {
	const identity: OptionIdentity = get(authStore).identity;

	if (!identity) {
		throw new Error('No internet identity.');
	}

	return createActor({
		canisterId,
		idlFactory: idlFactorSatellite008,
		identity
	});
};

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const getSatelliteActor009 = (canisterId: Principal): Promise<SatelliteActor009> => {
	const identity: OptionIdentity = get(authStore).identity;

	if (!identity) {
		throw new Error('No internet identity.');
	}

	return createActor({
		canisterId,
		idlFactory: idlFactorSatellite009,
		identity
	});
};

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const getOrbiterActor007 = async ({
	orbiterId,
	identity
}: {
	orbiterId: Principal;
	identity: OptionIdentity;
}): Promise<OrbiterActor007> => {
	if (isNullish(identity)) {
		throw new Error('No internet identity.');
	}

	return createActor({
		canisterId: orbiterId,
		idlFactory: idlFactorOrbiter007,
		identity
	});
};
