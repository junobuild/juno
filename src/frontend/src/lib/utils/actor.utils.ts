import type { _SERVICE as ConsoleActor } from '$declarations/console/console.did';
import { idlFactory as idlFactorConsole } from '$declarations/console/console.factory.did';
import type { _SERVICE as MissionControlActor } from '$declarations/mission_control/mission_control.did';
import { idlFactory as idlFactorMissionControl } from '$declarations/mission_control/mission_control.factory.did';
import type { _SERVICE as ObservatoryActor } from '$declarations/observatory/observatory.did';
import { idlFactory as idlFactorObservatory } from '$declarations/observatory/observatory.factory.did';
import type { _SERVICE as SatelliteActor } from '$declarations/satellite/satellite.did';
import { idlFactory as idlFactorSatellite } from '$declarations/satellite/satellite.factory.did';
import { authStore } from '$lib/stores/auth.store';
import { getAgent } from '$lib/utils/agent.utils';
import { Actor, type ActorMethod, type ActorSubclass, type Identity } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
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

export const getSatelliteActor = async (canisterId: Principal): Promise<SatelliteActor> => {
	const identity: Identity | undefined | null = get(authStore).identity;

	if (!identity) {
		throw new Error('No internet identity.');
	}

	return createActor({
		canisterId,
		idlFactory: idlFactorSatellite,
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

export const createActor = async <T = Record<string, ActorMethod>>({
	canisterId,
	idlFactory,
	identity
}: {
	canisterId: string | Principal;
	idlFactory: IDL.InterfaceFactory;
	identity: Identity;
}): Promise<ActorSubclass<T>> => {
	const agent = await getAgent({ identity });

	// Creates an actor with using the candid interface and the HttpAgent
	return Actor.createActor(idlFactory, {
		agent,
		canisterId
	});
};
