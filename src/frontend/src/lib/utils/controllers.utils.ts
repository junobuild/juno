import type { SetControllerParams } from '$lib/types/controllers';
import type { MissionControlDid } from '$lib/types/declarations';
import { nonNullish, toNullable } from '@dfinity/utils';

export const toSetController = ({
	profile,
	scope
}: Omit<SetControllerParams, 'controllerId'>): MissionControlDid.SetController => ({
	metadata: nonNullish(profile) && profile !== '' ? [['profile', profile]] : [],
	expires_at: toNullable<bigint>(undefined),
	scope:
		scope === 'admin' ? { Admin: null } : scope === 'submit' ? { Submit: null } : { Write: null }
});
