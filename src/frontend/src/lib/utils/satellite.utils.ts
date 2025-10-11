import type { MissionControlDid, SatelliteDid } from '$declarations';
import { PAGINATION } from '$lib/constants/app.constants';
import { isDev } from '$lib/env/app.env';
import { SatelliteUiMetadataParser } from '$lib/schemas/satellite.schema';
import type { ListParams } from '$lib/types/list';
import type { SatelliteUi, SatelliteUiMetadata, SatelliteUiTags } from '$lib/types/satellite';
import { metadataEnvironment, metadataName, metadataTags } from '$lib/utils/metadata.utils';
import { Principal } from '@dfinity/principal';
import { isEmptyString, isNullish, notEmptyString, toNullable } from '@dfinity/utils';

export const satelliteUrl = (satelliteId: string): string => {
	if (isDev()) {
		return `http://${satelliteId}.localhost:5987`;
	}

	return `https://${satelliteId}.icp0.io`;
};

export const satelliteMetadata = (satellite: MissionControlDid.Satellite): SatelliteUiMetadata => ({
	name: satelliteName(satellite),
	environment: satelliteEnvironment(satellite),
	tags: satelliteTags(satellite)
});

export const satelliteName = ({ metadata }: MissionControlDid.Satellite): string =>
	metadataName(metadata);

export const satelliteEnvironment = ({
	metadata
}: MissionControlDid.Satellite): string | undefined => metadataEnvironment(metadata);

export const satelliteTags = ({
	metadata
}: MissionControlDid.Satellite): SatelliteUiTags | undefined => {
	const tags = metadataTags(metadata);
	const { data, success } = SatelliteUiMetadataParser.safeParse(tags);
	return success ? data : undefined;
};

export const satelliteMatchesFilter = ({
	filter,
	satellite: {
		satellite_id,
		metadata: { name, environment, tags }
	}
}: {
	satellite: SatelliteUi;
	filter: string;
}): boolean =>
	name.toLowerCase().includes(filter) ||
	satellite_id.toText().includes(filter) ||
	(notEmptyString(environment) && environment.includes(filter)) ||
	(tags ?? []).find((tag) => tag.includes(filter)) !== undefined;

export const toListParams = ({
	startAfter,
	limit = PAGINATION,
	order,
	filter: { matcher, description, owner }
}: ListParams): SatelliteDid.ListParams => ({
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
