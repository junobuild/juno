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
import { authStore } from '$lib/stores/auth.store';
import { createActor } from '$lib/utils/actor.utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { get } from 'svelte/store';

export const getConsoleActor = async (): Promise<ConsoleActor> => {
	const identity: Identity | undefined | null = get(authStore).identity;

	if (!identity) {
		throw new Error('No internet identity.');
	}

	// Canister IDs are automatically expanded to .env config - see vite.config.ts
	const canisterId = import.meta.env.VITE_CONSOLE_CANISTER_ID;

	return createActor({
		canisterId,
		idlFactory: idlFactorConsole,
		identity
	});
};

export const getObservatoryActor = async (): Promise<ObservatoryActor> => {
	const identity: Identity | undefined | null = get(authStore).identity;

	if (!identity) {
		throw new Error('No internet identity.');
	}

	// Canister IDs are automatically expanded to .env config - see vite.config.ts
	const canisterId = import.meta.env.VITE_OBSERVATORY_CANISTER_ID;

	return createActor({
		canisterId,
		idlFactory: idlFactorObservatory,
		identity
	});
};

export const getSatelliteActor = async ({
	satelliteId,
	identity: identityParam
}: {
	satelliteId: Principal;
	identity?: Identity;
}): Promise<SatelliteActor> => {
	const identity = identityParam ?? get(authStore).identity;

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
	const identity = identityParam ?? get(authStore).identity;

	if (!identity) {
		throw new Error('No internet identity.');
	}

	return createActor({
		canisterId: orbiterId,
		idlFactory: idlFactorOrbiter,
		identity
	});
};

export const getMissionControlActor = async (
	canisterId: Principal
): Promise<MissionControlActor> => {
	const identity: Identity | undefined | null = get(authStore).identity;

	if (!identity) {
		throw new Error('No internet identity.');
	}

	return createActor({
		canisterId,
		idlFactory: idlFactorMissionControl,
		identity
	});
};
