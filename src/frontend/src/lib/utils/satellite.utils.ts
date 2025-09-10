import type { Satellite } from '$declarations/mission_control/mission_control.did';
import type { ListParams as ListParamsApi } from '$declarations/satellite/satellite.did';
import { PAGINATION } from '$lib/constants/app.constants';
import { isDev } from '$lib/env/app.env';
import { SatelliteMetadataParser } from '$lib/schemas/mission-control';
import type { ListParams } from '$lib/types/list';
import type { SatelliteTags } from '$lib/types/mission-control';
import { metadataEnvironment, metadataName, metadataTags } from '$lib/utils/metadata.utils';
import { Principal } from '@dfinity/principal';
import { isEmptyString, isNullish, notEmptyString, toNullable } from '@dfinity/utils';

export const satelliteUrl = (satelliteId: string): string => {
	if (isDev()) {
		return `http://${satelliteId}.localhost:5987`;
	}

	return `https://${satelliteId}.icp0.io`;
};

export const satelliteName = ({ metadata }: Satellite): string => metadataName(metadata);

export const satelliteEnvironment = ({ metadata }: Satellite): string | undefined =>
	metadataEnvironment(metadata);

export const satelliteTags = ({ metadata }: Satellite): SatelliteTags | undefined => {
	const tags = metadataTags(metadata);
	const { data, success } = SatelliteMetadataParser.safeParse(tags);
	return success ? data : undefined;
};

export const toListParams = ({
	startAfter,
	limit = PAGINATION,
	order,
	filter: { matcher, description, owner }
}: ListParams): ListParamsApi => ({
	matcher:
		isEmptyString(matcher) && isEmptyString(description)
			? []
			: [
					{
						key: toNullable(notEmptyString(matcher) ? matcher : undefined),
						description: toNullable(notEmptyString(description) ? description : undefined),
						created_at: [],
						updated_at: []
					}
				],
	paginate: [
		{
			start_after: toNullable(startAfter),
			limit: [limit]
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
