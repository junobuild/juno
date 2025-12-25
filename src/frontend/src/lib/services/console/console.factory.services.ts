import { getConsoleActor } from '$lib/api/actors/actor.juno.api';
import type {
	CreateSatelliteConfig,
	CreateWithConfig,
	CreateWithConfigAndName
} from '$lib/types/factory';
import type { OrbiterId } from '$lib/types/orbiter';
import type { SatelliteId } from '$lib/types/satellite';
import type { Option } from '$lib/types/utils';
import { assertNonNullish, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';

export const createMissionControlWithConfig = async ({
	identity,
	config: { subnetId }
}: {
	identity: Option<Identity>;
	config: CreateWithConfig;
}): Promise<SatelliteId> => {
	assertNonNullish(identity);

	const { create_mission_control } = await getConsoleActor({
		identity
	});

	// TODO: duplicate payload
	return create_mission_control({
		subnet_id: toNullable(subnetId)
	});
};

export const createSatelliteWithConfig = async ({
	identity,
	config: { name, subnetId, kind }
}: {
	identity: Option<Identity>;
	config: CreateSatelliteConfig;
}): Promise<SatelliteId> => {
	assertNonNullish(identity);

	const { create_satellite } = await getConsoleActor({
		identity
	});

	// TODO: duplicate payload
	return create_satellite({
		// Unused
		block_index: toNullable(),
		// We use the same API as the one use by the Mission Control.
		// The backend fetches the account for that user and then assert its owner is equals to the caller.
		user: identity.getPrincipal(),
		name: toNullable(name),
		subnet_id: toNullable(subnetId),
		storage: toNullable(
			kind === 'application'
				? {
						system_memory: toNullable({
							Stable: null
						})
					}
				: undefined
		)
	});
};

export const createOrbiterWithConfig = async ({
	identity,
	config: { name, subnetId }
}: {
	identity: Option<Identity>;
	config: CreateWithConfigAndName;
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
