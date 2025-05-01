import type {
	OrbiterSatelliteConfig as SatelliteConfig,
	SetSatelliteConfig
} from '$declarations/deprecated/orbiter-0-0-7.did';
import type { AnalyticsClientsPageViews } from '$declarations/deprecated/orbiter-0-0-8.did';
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

/**
 * @deprecated operating systems was introduced in v1.0.0
 */
export const getAnalyticsClientsPageViews008 = async ({
	satelliteId,
	orbiterId,
	from,
	to,
	identity
}: PageViewsParams): Promise<AnalyticsClientsPageViews> => {
	const { get_page_views_analytics_clients } = await getOrbiterActor008({ orbiterId, identity });
	return await get_page_views_analytics_clients({
		satellite_id: toNullable(satelliteId),
		from: nonNullish(from) ? [toBigIntNanoSeconds(from)] : [],
		to: nonNullish(to) ? [toBigIntNanoSeconds(to)] : []
	});
};
