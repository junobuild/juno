import { SatelliteUiMetadataParser } from '$lib/schemas/satellite.schema';
import type { Ufo, UfoUi, UfoUiMetadata, UfoUiTags } from '$lib/types/ufo';
import { metadataEnvironment, metadataName, metadataTags } from '$lib/utils/metadata.utils';
import { notEmptyString } from '@dfinity/utils';

export const ufoMetadata = (ufo: Ufo): UfoUiMetadata => ({
	name: ufoName(ufo),
	environment: ufoEnvironment(ufo),
	tags: ufoTags(ufo)
});

export const ufoName = ({ metadata }: Ufo): string => metadataName(metadata);

export const ufoEnvironment = ({ metadata }: Ufo): string | undefined =>
	metadataEnvironment(metadata);

export const ufoTags = ({ metadata }: Ufo): UfoUiTags | undefined => {
	const tags = metadataTags(metadata);
	const { data, success } = SatelliteUiMetadataParser.safeParse(tags);
	return success ? data : undefined;
};

// eslint-disable-next-line local-rules/prefer-object-params
export const sortUfos = (a: Ufo, b: Ufo): number => ufoName(a).localeCompare(ufoName(b));

export const ufoMatchesFilter = ({
	filter,
	ufo: {
		ufo_id,
		metadata: { name, environment, tags }
	}
}: {
	ufo: UfoUi;
	filter: string;
}): boolean =>
	name.toLowerCase().includes(filter) ||
	ufo_id.toText().includes(filter) ||
	(notEmptyString(environment) && environment.includes(filter)) ||
	(tags ?? []).find((tag) => tag.includes(filter)) !== undefined;
