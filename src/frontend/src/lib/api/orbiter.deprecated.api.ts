import type {
	OrbiterSatelliteConfig as SatelliteConfig,
	SetSatelliteConfig
} from '$declarations/deprecated/orbiter-0-0-7.did';
import { getOrbiterActor007 } from '$lib/api/actors/actor.deprecated.api';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Principal } from '@dfinity/principal';

/**
 * @deprecated
 */
export const listOrbiterSatelliteConfigs007 = async ({
	orbiterId,
	identity
}: {
	orbiterId: Principal;
	identity: OptionIdentity;
}): Promise<[Principal, SatelliteConfig][]> => {
	const { list_satellite_configs } = await getOrbiterActor007({ orbiterId, identity });
	return list_satellite_configs();
};

/**
 * @deprecated
 */
export const setOrbiterSatelliteConfigs007 = async ({
	orbiterId,
	config,
	identity
}: {
	orbiterId: Principal;
	config: [Principal, SetSatelliteConfig][];
	identity: OptionIdentity;
}): Promise<[Principal, SatelliteConfig][]> => {
	const actor = await getOrbiterActor007({ orbiterId, identity });
	return actor.set_satellite_configs(config);
};

/**
 * @deprecated - Replaced in Orbiter > v0.0.8 with public custom section juno:package
 */
export const orbiterVersion = async ({
	orbiterId,
	identity
}: {
	orbiterId: Principal;
	identity: OptionIdentity;
}): Promise<string> => {
	const { version } = await getOrbiterActor007({ orbiterId, identity });
	return version();
};
