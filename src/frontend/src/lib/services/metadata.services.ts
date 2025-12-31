import type { MissionControlDid } from '$declarations';
import { setSatelliteMetadata as setSatelliteMetadataApi } from '$lib/api/mission-control.api';
import {
	METADATA_KEY_ENVIRONMENT,
	METADATA_KEY_NAME,
	METADATA_KEY_TAGS
} from '$lib/constants/metadata.constants';
import { satellitesStore } from '$lib/derived/mission-control/satellites.derived';
import {
	SatelliteUiMetadataSchema,
	SatelliteUiMetadataSerializer
} from '$lib/schemas/satellite.schema';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { authStore } from '$lib/stores/auth.store';
import { satellitesUncertifiedStore } from '$lib/stores/mission-control/satellites.store';
import type { MissionControlId } from '$lib/types/mission-control';
import type { SatelliteUiMetadata } from '$lib/types/satellite';
import type { Option } from '$lib/types/utils';
import { notEmptyString } from '@dfinity/utils';
import { get } from 'svelte/store';
import * as z from 'zod';
import type { OptionIdentity } from '$lib/types/itentity';

export const setSatelliteMetadata = async ({
	missionControlId,
	satellite: { satellite_id: satelliteId, metadata: currentMetadata },
	metadata,
	identity
}: {
	missionControlId: Option<MissionControlId>;
	satellite: MissionControlDid.Satellite;
	metadata: SatelliteUiMetadata;
	identity: OptionIdentity
}): Promise<{ success: boolean }> => {
	const { error, success, data } = SatelliteUiMetadataSchema.safeParse(metadata);

	if (!success) {
		toasts.error({
			text: get(i18n).errors.invalid_metadata,
			detail: z.prettifyError(error)
		});
		return { success: false };
	}

	const { name: satelliteName, environment: satelliteEnv, tags: satelliteTags } = data;

	try {
		const updateData = new Map<string, string>(currentMetadata);
		updateData.set(METADATA_KEY_NAME, satelliteName);

		if (notEmptyString(satelliteEnv)) {
			updateData.set(METADATA_KEY_ENVIRONMENT, satelliteEnv);
		} else {
			updateData.delete(METADATA_KEY_ENVIRONMENT);
		}

		const tags = SatelliteUiMetadataSerializer.parse(satelliteTags);

		if (notEmptyString(tags)) {
			updateData.set(METADATA_KEY_TAGS, tags);
		} else {
			updateData.delete(METADATA_KEY_TAGS);
		}

		const updatedSatellite = await setSatelliteMetadataApi({
			missionControlId,
			satelliteId,
			metadata: Array.from(updateData),
			identity
		});

		const satellites = get(satellitesStore);
		satellitesUncertifiedStore.set([
			...(satellites ?? []).filter(
				({ satellite_id }) => updatedSatellite.satellite_id.toText() !== satellite_id.toText()
			),
			updatedSatellite
		]);

		return { success: true };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.satellite_metadata_update,
			detail: err
		});

		return { success: false };
	}
};
