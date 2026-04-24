import { listOrbiterControllers as listOrbiterControllersApi } from '$lib/api/orbiter.api';
import { mapAccessKeysUi } from '$lib/services/access-keys/_key.list.services';
import type { AccessKeyUi } from '$lib/types/access-keys';
import type { NullishIdentity } from '$lib/types/itentity';
import type { OrbiterId } from '$lib/types/orbiter';

export const listOrbiterControllers = async (params: {
	orbiterId: OrbiterId;
	identity: NullishIdentity;
}): Promise<[OrbiterId, AccessKeyUi][]> => {
	const accessKeys = await listOrbiterControllersApi(params);
	return mapAccessKeysUi(accessKeys);
};
