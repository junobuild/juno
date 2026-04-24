import type { MissionControlDid } from '$declarations';
import type { AccessKeyUi } from '$lib/types/access-keys';
import type { MissionControlId } from '$lib/types/mission-control';
import { fromNullable } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';

export const mapAccessKeysUi = (
	keys: [Principal, MissionControlDid.AccessKey][]
): [MissionControlId, AccessKeyUi][] =>
	keys.map(([id, { expires_at, updated_at, created_at, ...rest }]) => [
		id,
		{
			...rest,
			expiresAt: fromNullable(expires_at),
			createdAt: created_at,
			updatedAt: updated_at
		}
	]);
