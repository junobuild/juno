import type { Satellite } from '$declarations/mission_control/mission_control.did';
import type { ListParams as ListParamsApi } from '$declarations/satellite/satellite.did';
import { localIdentityCanisterId, PAGINATION } from '$lib/constants/constants';
import type { ListParams } from '$lib/types/list';
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

export const toListParams = ({ startAfter, order }: ListParams): ListParamsApi => ({
	matcher: [],
	paginate: [
		{
			start_after: toNullable(startAfter),
			limit: [PAGINATION]
		}
	],
	order: [
		{
			desc: order.desc,
			field:
				order.field === 'created_at'
					? { CreatedAt: null }
					: order.field === 'updated_at'
					? { UpdatedAt: null }
					: { Keys: null }
		}
	]
});
