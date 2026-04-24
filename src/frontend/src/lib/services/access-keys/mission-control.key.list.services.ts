import { listMissionControlControllers as listMissionControlControllersApi } from '$lib/api/mission-control.api';
import { mapAccessKeysUi } from '$lib/services/access-keys/_key.list.services';
import type { AccessKeyUi } from '$lib/types/access-keys';
import type { NullishIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';

export const listMissionControlControllers = async (params: {
	missionControlId: MissionControlId;
	identity: NullishIdentity;
}): Promise<[MissionControlId, AccessKeyUi][]> => {
	const accessKeys = await listMissionControlControllersApi(params);
	return mapAccessKeysUi(accessKeys);
};
