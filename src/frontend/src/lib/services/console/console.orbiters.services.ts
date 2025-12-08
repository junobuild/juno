import { getConsoleActor } from '$lib/api/actors/actor.juno.api';
import type { OrbiterId } from '$lib/types/orbiter';
import type { Option } from '$lib/types/utils';
import { toNullable } from '@dfinity/utils';
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
	const { create_orbiter } = await getConsoleActor({
		identity
	});

	return create_orbiter({
		name: toNullable(name),
		subnet_id: toNullable(subnetId)
	});
};
