import { deleteControllers as deleteSatelliteControllers } from '$lib/api/satellites.api';
import {
	removeAdminAccessKey,
	type AdminAccessKeyResult,
	type DeleteAccessKeysFn
} from '$lib/services/access-keys/key.admin.services';
import type { AccessKeyIdParam } from '$lib/types/access-keys';
import type { SatelliteId } from '$lib/types/satellite';
import type { Identity } from '@icp-sdk/core/agent';

export const removeSatellitesAccessKey = async ({
	identity,
	satelliteIds,
	accessKeyId
}: {
	satelliteIds: SatelliteId[];
	identity: Identity;
} & AccessKeyIdParam) => {
	// If the key is not an admin, it won't be removed as we perform a check.
	// Therefore, we can always use this path.
	await removeSatellitesAdminAccessKey({
		identity,
		satelliteIds,
		accessKeyId
	});
};

export const removeSatellitesAdminAccessKey = async ({
	satelliteIds,
	accessKeyId,
	identity,
	...rest
}: {
	satelliteIds: SatelliteId[];
	identity: Identity;
} & AccessKeyIdParam) => {
	const setSatelliteAdminAccessKeyWithIcMgmt = async (
		satelliteId: SatelliteId
	): Promise<AdminAccessKeyResult> => {
		const deleteAccessKeysFn: DeleteAccessKeysFn = async ({ args }) => {
			await deleteSatelliteControllers({
				args,
				satelliteId,
				identity
			});
		};

		return await removeAdminAccessKey({
			deleteAccessKeysFn,
			...rest,
			canisterId: satelliteId,
			accessKeyId,
			identity
		});
	};

	await Promise.all(satelliteIds.map(setSatelliteAdminAccessKeyWithIcMgmt));
};
