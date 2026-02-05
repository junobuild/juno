import type { MissionControlDid } from '$declarations';
import type { AddAccessKeyParams } from '$lib/types/access-keys';
import { nonNullish, toNullable } from '@dfinity/utils';

export const toSetController = ({
	metadata,
	scope
}: Omit<AddAccessKeyParams, 'accessKeyId'>): MissionControlDid.SetController => {
	const profile = nonNullish(metadata) && 'profile' in metadata ? metadata.profile : undefined;
	const kind = nonNullish(metadata) && 'kind' in metadata ? metadata.kind : undefined;

	return {
		metadata: nonNullish(profile) && profile !== '' ? [['profile', profile]] : [],
		expires_at: toNullable<bigint>(undefined),
		kind: toNullable(
			kind === 'automation'
				? { Automation: null }
				: kind === 'emulator'
					? { Emulator: null }
					: undefined
		),
		scope:
			scope === 'admin' ? { Admin: null } : scope === 'submit' ? { Submit: null } : { Write: null }
	};
};
