import type { AnalyticKey, PageView } from '$declarations/orbiter/orbiter.did';
import { getOrbiterActor } from '$lib/utils/actor.utils';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import type { Principal } from '@dfinity/principal';

// TODO: from to
export const getPageViews = async ({
	satelliteId,
	orbiterId
}: {
	satelliteId: Principal;
	orbiterId: Principal;
}): Promise<[AnalyticKey, PageView][]> => {
	const actor = await getOrbiterActor(orbiterId);
	return actor.get_page_views({
		satellite_id: satelliteId,
		from: toBigIntNanoSeconds(new Date(Date.now() - 864000000)),
		to: toBigIntNanoSeconds(new Date(Date.now() + 864000000))
	});
};
