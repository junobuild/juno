import { getConsoleActor } from '$lib/api/actors/actor.juno.api';
import type { OrbiterId } from '$lib/types/orbiter';
import type { Option } from '$lib/types/utils';
import { assertNonNullish, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';

// TODO: duplicate
interface CreateOrbiterConfig {
	name?: string;
	subnetId?: Principal;
}

export const createOrbiterWithConfig = async ({
	identity,
	config: { name, subnetId }
}: {
	identity: Option<Identity>;
	config: CreateOrbiterConfig;
}): Promise<OrbiterId> => {
	assertNonNullish(identity);

	const { create_orbiter } = await getConsoleActor({
		identity
	});

	// TODO: duplicate payload as in console.satellites.services
	return create_orbiter({
		// Unused
		block_index: toNullable(),
		// We use the same API as the one use by the Mission Control.
		// The backend fetches the account for that user and then assert its owner is equals to the caller.
		user: identity.getPrincipal(),
		name: toNullable(name),
		subnet_id: toNullable(subnetId)
	});
};
