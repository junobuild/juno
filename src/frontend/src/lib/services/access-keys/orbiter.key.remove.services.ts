import { deleteControllers as deleteOrbiterControllers } from '$lib/api/orbiter.api';
import {
	removeAdminAccessKey,
	type AdminAccessKeyResult,
	type DeleteAccessKeysFn
} from '$lib/services/access-keys/key.admin.services';
import type { AccessKeyIdParam } from '$lib/types/access-keys';
import type { OrbiterId } from '$lib/types/orbiter';
import type { Identity } from '@icp-sdk/core/agent';

export const removeOrbiterAccessKey = async ({
	identity,
	orbiterIds,
	accessKeyId
}: {
	orbiterIds: OrbiterId[];
	identity: Identity;
} & AccessKeyIdParam) => {
	// If the key is not an admin, it won't be removed as we perform a check.
	// Therefore, we can always use this path.
	await removeOrbitersAdminAccessKey({
		identity,
		orbiterIds,
		accessKeyId
	});
};

const removeOrbitersAdminAccessKey = async ({
	orbiterIds,
	accessKeyId,
	identity,
	...rest
}: {
	orbiterIds: OrbiterId[];
	identity: Identity;
} & AccessKeyIdParam) => {
	const setOrbiterAdminAccessKeyWithIcMgmt = async (
		orbiterId: OrbiterId
	): Promise<AdminAccessKeyResult> => {
		const deleteAccessKeysFn: DeleteAccessKeysFn = async ({ args }) => {
			await deleteOrbiterControllers({
				args,
				orbiterId,
				identity
			});
		};

		return await removeAdminAccessKey({
			deleteAccessKeysFn,
			...rest,
			canisterId: orbiterId,
			accessKeyId,
			identity
		});
	};

	await Promise.all(orbiterIds.map(setOrbiterAdminAccessKeyWithIcMgmt));
};
