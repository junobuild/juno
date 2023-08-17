import type {
	AnalyticKey,
	Controller,
	OriginConfig,
	PageView,
	SetOriginConfig
} from '$declarations/orbiter/orbiter.did';
import type { SetControllerParams } from '$lib/types/controllers';
import type { PageViewsPeriod } from '$lib/types/ortbiter';
import { getOrbiterActor } from '$lib/utils/actor.utils';
import { toSetController } from '$lib/utils/controllers.utils';
import { toBigIntNanoSeconds } from '$lib/utils/date.utils';
import { toNullable } from '$lib/utils/did.utils';
import { nonNullish } from '$lib/utils/utils';
import { Principal } from '@dfinity/principal';

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
	return actor.get_page_views({
		satellite_id: toNullable(satelliteId),
		from: nonNullish(from) ? [toBigIntNanoSeconds(from)] : [],
		to: nonNullish(to) ? [toBigIntNanoSeconds(to)] : []
	});
};

export const listOrbiterControllers = async ({
	orbiterId
}: {
	orbiterId: Principal;
}): Promise<[Principal, Controller][]> => {
	const actor = await getOrbiterActor(orbiterId);
	return actor.list_controllers();
};

export const deleteOrbiterController = async ({
	orbiterId,
	controller
}: {
	orbiterId: Principal;
	controller: Principal;
}) => {
	const actor = await getOrbiterActor(orbiterId);
	await actor.del_controllers({ controllers: [controller] });
};

export const setOrbiterController = async ({
	orbiterId,
	controllerId,
	...rest
}: {
	orbiterId: Principal;
} & SetControllerParams) => {
	try {
		const actor = await getOrbiterActor(orbiterId);
		await actor.set_controllers({
			controller: toSetController(rest),
			controllers: [Principal.fromText(controllerId)]
		});
	} catch (err: unknown) {
		console.error('setOrbiterController:', orbiterId.toText());
		throw err;
	}
};

export const listOriginConfigs = async ({
	orbiterId
}: {
	orbiterId: Principal;
}): Promise<[Principal, OriginConfig][]> => {
	const actor = await getOrbiterActor(orbiterId);
	return actor.list_origin_configs();
};

export const setOriginConfig = async ({
	satelliteId,
	orbiterId,
	config
}: {
	orbiterId: Principal;
	satelliteId: Principal;
	config: SetOriginConfig;
}): Promise<OriginConfig> => {
	const actor = await getOrbiterActor(orbiterId);
	return actor.set_origin_config(satelliteId, config);
};
