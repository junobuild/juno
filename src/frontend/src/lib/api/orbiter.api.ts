import type { AnalyticKey, PageView } from '$declarations/orbiter/orbiter.did';
import type { PageViewsPeriod } from '$lib/types/ortbiter';
import { getOrbiterActor } from '$lib/utils/actor.utils';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import { toNullable } from '$lib/utils/did.utils';
import { nonNullish } from '$lib/utils/utils';
import type { Principal } from '@dfinity/principal';

export const getPageViews = async ({
	satelliteId,
	orbiterId,
	from,
	to
}: {
	satelliteId?: Principal;
	orbiterId: Principal;
} & PageViewsPeriod): Promise<[AnalyticKey, PageView][]> => {
	const actor = await getOrbiterActor(orbiterId);

	console.log(from, to);

	return actor.get_page_views({
		satellite_id: toNullable(satelliteId),
		from: nonNullish(from) ? [toBigIntNanoSeconds(from)] : [],
		to: nonNullish(to) ? [toBigIntNanoSeconds(to)] : []
	});
};
