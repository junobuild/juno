import type {
	OrbiterSatelliteConfig as SatelliteConfig,
	SetSatelliteConfig
} from '$declarations/deprecated/orbiter-0-0-8.did';
import type { OptionIdentity } from '$lib/types/itentity';
import { getOrbiterActor008 } from '$lib/utils/actor.deprecated.utils';
import { Principal } from '@dfinity/principal';

export const setOrbiterSatelliteConfigs = async ({
	orbiterId,
	config,
	identity
}: {
	orbiterId: Principal;
	config: [Principal, SetSatelliteConfig][];
	identity: OptionIdentity;
}): Promise<[Principal, SatelliteConfig][]> => {
	const actor = await getOrbiterActor008({ orbiterId, identity });
	return actor.set_satellite_configs(config);
};
