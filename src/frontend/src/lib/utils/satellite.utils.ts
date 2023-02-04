import type { Satellite } from '$declarations/mission_control/mission_control.did';
import type { ListParams } from '$declarations/satellite/satellite.did';
import { localIdentityCanisterId, PAGINATION } from '$lib/constants/constants';
import { toNullable } from '$lib/utils/did.utils';
import { nonNullish } from '$lib/utils/utils';

export const satelliteUrl = (satelliteId: string): string => {
	if (nonNullish(localIdentityCanisterId)) {
		return `http://${satelliteId}.localhost:8000`;
	}

	return `https://${satelliteId}.ic0.app`;
};

export const satelliteName = ({ metadata }: Satellite): string =>
	new Map(metadata).get('name') ?? '';

export const listParams = ({ startAfter }: { startAfter?: string }): ListParams => ({
	matcher: [],
	paginate: [
		{
			start_after: toNullable(startAfter),
			limit: [PAGINATION]
		}
	],
	order: toNullable({
		desc: false
	})
});
