import type { _SERVICE as SatelliteActor008 } from '$declarations/deprecated/satellite-0-0-8.did';
import { idlFactory as idlFactorSatellite008 } from '$declarations/deprecated/satellite-0-0-8.factory.did';
import { authStore } from '$lib/stores/auth.store';
import { createActor } from '$lib/utils/actor.utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { get } from 'svelte/store';

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const getSatelliteActor008 = (canisterId: Principal): Promise<SatelliteActor008> => {
	const identity: Identity | undefined | null = get(authStore).identity;

	if (!identity) {
		throw new Error('No internet identity.');
	}

	return createActor({
		canisterId,
		idlFactory: idlFactorSatellite008,
		identity
	});
};
