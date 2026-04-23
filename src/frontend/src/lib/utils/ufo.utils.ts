import type { Ufo, UfoUi } from '$lib/types/ufo';
import { metadataUiName } from '$lib/utils/metadata-ui.utils';
import { notEmptyString } from '@dfinity/utils';

// eslint-disable-next-line local-rules/prefer-object-params
export const sortUfos = (a: Ufo, b: Ufo): number =>
	metadataUiName(a).localeCompare(metadataUiName(b));

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
