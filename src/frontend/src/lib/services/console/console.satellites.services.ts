import { getConsoleActor } from '$lib/api/actors/actor.juno.api';
import type { SatelliteId } from '$lib/types/satellite';
import type { Option } from '$lib/types/utils';
import { assertNonNullish, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';

// TODO duplicate
interface CreateSatelliteConfig {
	name: string;
	subnetId?: Principal;
	kind: 'website' | 'application';
}

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
