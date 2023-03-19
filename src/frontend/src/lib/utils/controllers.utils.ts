import type { SetController as SetControllerMissionControl } from '$declarations/mission_control/mission_control.did';
import { toNullable } from '$lib/utils/did.utils';
import { nonNullish } from '$lib/utils/utils';

export const toSetController = (
	profile: string | null | undefined
): SetControllerMissionControl => ({
	metadata: nonNullish(profile) && profile !== '' ? [['profile', profile]] : [],
	expires_at: toNullable<bigint>(undefined)
});
