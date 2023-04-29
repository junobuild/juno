import type { SetController as SetControllerDid } from '$declarations/mission_control/mission_control.did';
import type { SetControllerParams } from '$lib/types/controlers';
import { toNullable } from '$lib/utils/did.utils';
import { nonNullish } from '$lib/utils/utils';

export const toSetController = ({
	profile,
	scope
}: Omit<SetControllerParams, 'controllerId'>): SetControllerDid => ({
	metadata: nonNullish(profile) && profile !== '' ? [['profile', profile]] : [],
	expires_at: toNullable<bigint>(undefined),
	scope: scope === 'admin' ? { Admin: null } : { Write: null }
});
