import type { _SERVICE as SatelliteActor } from '$declarations/deprecated/satellite-deprecated-no-scope.did';
import { idlFactory as idlFactorSatellite } from '$declarations/deprecated/satellite-deprecated-no-scope.factory.did';
import { authStore } from '$lib/stores/auth.store';
import { createActor } from '$lib/utils/actor.utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { get } from 'svelte/store';

/**
 * @deprecated TODO: to be remove - backwards compatibility
 */
export const getSatelliteActorDeprecated = (canisterId: Principal): Promise<SatelliteActor> => {
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
