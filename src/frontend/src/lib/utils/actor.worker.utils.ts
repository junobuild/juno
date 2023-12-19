import type { _SERVICE as OrbiterActor } from '$declarations/orbiter/orbiter.did';
import { idlFactory as idlFactorOrbiter } from '$declarations/orbiter/orbiter.factory.did';
import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { createActor } from '$lib/utils/actor.utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';

export const getSatelliteActor = async ({
	satelliteId,
	identity: identityParam
}: {
	satelliteId: Principal;
	identity?: Identity;
}): Promise<SatelliteActor> => {
	const identity = identityParam;

	if (!identity) {
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
	identity: identityParam
}: {
	orbiterId: Principal;
	identity?: Identity;
}): Promise<OrbiterActor> => {
	const identity = identityParam;

	if (!identity) {
		throw new Error('No internet identity.');
	}

	return createActor({
		canisterId: orbiterId,
		idlFactory: idlFactorOrbiter,
		identity
	});
};
