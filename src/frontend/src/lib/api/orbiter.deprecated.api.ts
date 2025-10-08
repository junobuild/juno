import type { OrbiterDid007, OrbiterDid008 } from '$declarations';
import { getOrbiterActor007, getOrbiterActor008 } from '$lib/api/actors/actor.deprecated.api';
import type { OptionIdentity } from '$lib/types/itentity';
import type { PageViewsParams } from '$lib/types/orbiter';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import type { Principal } from '@dfinity/principal';
import { nonNullish, toNullable } from '@dfinity/utils';

/**
 * @deprecated
 */
export const listOrbiterSatelliteConfigs007 = async ({
	orbiterId,
	identity
}: {
	orbiterId: Principal;
	identity: OptionIdentity;
}): Promise<[Principal, OrbiterDid007.OrbiterSatelliteConfig][]> => {
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
	config: [Principal, OrbiterDid007.SetSatelliteConfig][];
	identity: OptionIdentity;
}): Promise<[Principal, OrbiterDid007.OrbiterSatelliteConfig][]> => {
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

/**
 * @deprecated operating systems was introduced in v1.0.0
 */
export const getAnalyticsClientsPageViews008 = async ({
	satelliteId,
	orbiterId,
	from,
	to,
	identity
}: PageViewsParams): Promise<OrbiterDid008.AnalyticsClientsPageViews> => {
	const { get_page_views_analytics_clients } = await getOrbiterActor008({ orbiterId, identity });
	return await get_page_views_analytics_clients({
		satellite_id: toNullable(satelliteId),
		from: nonNullish(from) ? [toBigIntNanoSeconds(from)] : [],
		to: nonNullish(to) ? [toBigIntNanoSeconds(to)] : []
	});
};
