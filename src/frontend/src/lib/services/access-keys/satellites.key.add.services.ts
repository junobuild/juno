import { setControllers as setSatelliteControllers } from '$lib/api/satellites.api';
import {
	setAdminAccessKey,
	type AdminAccessKeyResult,
	type SetAccessKeysFn
} from '$lib/services/access-keys/key.admin.services';
import { mapSatellitesForControllersFn } from '$lib/services/access-keys/satellites.key.map.services';
import type {
	AddAccessKeyParams,
	AddAccessKeyScope,
	AddAdminAccessKeyParams
} from '$lib/types/access-keys';
import type { SatelliteId } from '$lib/types/satellite';
import { toSetController } from '$lib/utils/controllers.utils';
import type { Identity } from '@icp-sdk/core/agent';
import { Principal } from '@icp-sdk/core/principal';

export const addSatellitesAccessKey = async ({
	identity,
	satelliteIds: satelliteIdsParam,
	accessKeyId,
	scope,
	profile
}: {
	satelliteIds: Principal[];
	identity: Identity;
} & AddAccessKeyParams) => {
	const { satelliteIds } = await filterSatelliteIds({ satelliteIds: satelliteIdsParam, identity });

	if (scope === 'admin') {
		await setSatellitesAdminAccessKey({
			identity,
			satelliteIds,
			accessKeyId,
			profile
		});
		return;
	}

	await setSatellitesNonAdminAccessKey({
		identity,
		satelliteIds,
		accessKeyId,
		profile,
		scope
	});
};

export const addSatellitesAdminAccessKey = async ({
	satelliteIds: satelliteIdsParam,
	identity,
	...rest
}: {
	satelliteIds: SatelliteId[];
	identity: Identity;
} & AddAdminAccessKeyParams) => {
	const { satelliteIds } = await filterSatelliteIds({ satelliteIds: satelliteIdsParam, identity });

	await setSatellitesAdminAccessKey({
		identity,
		...rest,
		satelliteIds
	});
};

const filterSatelliteIds = async ({
	satelliteIds: satelliteIdsParam,
	identity
}: {
	satelliteIds: SatelliteId[];
	identity: Identity;
}): Promise<{ satelliteIds: SatelliteId[] }> => {
	const { setSatelliteIds: satelliteIds, addSatellitesIds } = await mapSatellitesForControllersFn({
		satelliteIds: satelliteIdsParam,
		identity
	});

	if (addSatellitesIds.length > 0) {
		// TODO: throw exception asking for upgrade super old Satellites so unlikely
	}

	return { satelliteIds };
};

const setSatellitesAdminAccessKey = async ({
	satelliteIds,
	accessKeyId,
	identity,
	...rest
}: {
	satelliteIds: SatelliteId[];
	identity: Identity;
} & AddAdminAccessKeyParams) => {
	const setSatelliteAdminAccessKey = async (
		satelliteId: SatelliteId
	): Promise<AdminAccessKeyResult> => {
		const setAccessKeysFn: SetAccessKeysFn = async ({ args }) => {
			await setSatelliteControllers({
				args,
				satelliteId,
				identity
			});
		};

		return await setAdminAccessKey({
			setAccessKeysFn,
			...rest,
			canisterId: satelliteId,
			accessKeyId,
			identity
		});
	};

	await Promise.all(satelliteIds.map(setSatelliteAdminAccessKey));
};

const setSatellitesNonAdminAccessKey = async ({
	satelliteIds,
	accessKeyId,
	identity,
	profile,
	scope
}: {
	satelliteIds: SatelliteId[];
	identity: Identity;
	scope: Omit<AddAccessKeyScope, 'admin'>;
} & AddAdminAccessKeyParams) => {
	const setSatelliteAccessKey = async (satelliteId: SatelliteId): Promise<void> => {
		await setSatelliteControllers({
			args: {
				controller: toSetController({
					profile,
					scope: scope as AddAccessKeyScope // Safe case, the param is explicit to avoid passing admin to the function
				}),
				controllers: [Principal.from(accessKeyId)]
			},
			satelliteId,
			identity
		});
	};

	await Promise.all(satelliteIds.map(setSatelliteAccessKey));
};
