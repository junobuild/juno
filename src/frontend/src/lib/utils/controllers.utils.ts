import type { MissionControlDid } from '$declarations';
import type { AddAccessKeyParams } from '$lib/types/access-keys';
import { nonNullish, toNullable } from '@dfinity/utils';

export const toSetController = ({
	profile,
	scope
}: Omit<AddAccessKeyParams, 'accessKeyId'>): MissionControlDid.SetController => ({
	metadata: nonNullish(profile) && profile !== '' ? [['profile', profile]] : [],
	expires_at: toNullable<bigint>(undefined),
	kind: toNullable(),
	scope:
		scope === 'admin' ? { Admin: null } : scope === 'submit' ? { Submit: null } : { Write: null }
});
