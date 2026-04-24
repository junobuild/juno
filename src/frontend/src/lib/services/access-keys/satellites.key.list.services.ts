import { listControllers } from '$lib/api/satellites.api';
import { mapAccessKeysUi } from '$lib/services/access-keys/_key.list.services';
import type { AccessKeyUi } from '$lib/types/access-keys';
import type { NullishIdentity } from '$lib/types/itentity';
import type { SatelliteId } from '$lib/types/satellite';

export const listSatelliteControllers = async (params: {
	satelliteId: SatelliteId;
	identity: NullishIdentity;
}): Promise<[SatelliteId, AccessKeyUi][]> => {
	const accessKeys = await listControllers(params);
	return mapAccessKeysUi(accessKeys);
};
