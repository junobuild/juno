import type { Satellite } from '$declarations/mission_control/mission_control.did';
import type { ListParams as ListParamsApi } from '$declarations/satellite/satellite.did';
import { localIdentityCanisterId, PAGINATION } from '$lib/constants/constants';
import type { ListParams } from '$lib/types/list';
import { metadataName } from '$lib/utils/metadata.utils';
import { Principal } from '@dfinity/principal';
import { isNullish, nonNullish, toNullable } from '@dfinity/utils';

export const satelliteUrl = (satelliteId: string): string => {
	if (nonNullish(localIdentityCanisterId)) {
		return `http://${satelliteId}.localhost:8000`;
	}

	return `https://${satelliteId}.icp0.io`;
};

export const satelliteName = ({ metadata }: Satellite): string => metadataName(metadata);

export const toListParams = ({
	startAfter,
	order,
	filter: { matcher, owner }
}: ListParams): ListParamsApi => ({
	matcher:
		isNullish(matcher) || matcher === ''
			? []
			: [
					{
						key: toNullable(matcher),
						description: []
					}
				],
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
	],
	owner: toNullable(owner === '' || isNullish(owner) ? null : Principal.fromText(owner))
});
