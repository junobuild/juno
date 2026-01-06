import type { MissionControlDid } from '$declarations';
import type { SegmentKey } from '$declarations/console/console.did';
import { setSegmentMetadata } from '$lib/api/console.api';
import { setSatelliteMetadata as setSatelliteMetadataApi } from '$lib/api/mission-control.api';
import {
	METADATA_KEY_ENVIRONMENT,
	METADATA_KEY_NAME,
	METADATA_KEY_TAGS
} from '$lib/constants/metadata.constants';
import { segments } from '$lib/derived/console/segments.derived';
import { mctrlSatellitesStore } from '$lib/derived/mission-control/mission-control-satellites.derived';
import {
	SatelliteUiMetadataSchema,
	SatelliteUiMetadataSerializer
} from '$lib/schemas/satellite.schema';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { segmentsUncertifiedStore } from '$lib/stores/console/segments.store';
import { satellitesUncertifiedStore } from '$lib/stores/mission-control/satellites.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Metadata } from '$lib/types/metadata';
import type { MissionControlId } from '$lib/types/mission-control';
import type { SatelliteId, SatelliteUiMetadata } from '$lib/types/satellite';
import type { Option } from '$lib/types/utils';
import { isNullish, nonNullish, notEmptyString } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { get } from 'svelte/store';
import * as z from 'zod';

interface SetSatelliteMetadataParams {
	missionControlId: Option<MissionControlId>;
	satellite: MissionControlDid.Satellite;
	metadata: SatelliteUiMetadata;
	identity: OptionIdentity;
}

export const setSatelliteMetadata = async ({
	missionControlId,
	satellite: { satellite_id: satelliteId, metadata: currentMetadata },
	metadata,
	identity
}: SetSatelliteMetadataParams): Promise<{ success: boolean }> => {
	// TODO: indentity check service
	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: get(i18n).core.not_logged_in });
		return { success: false };
	}

	const { error, success, data } = SatelliteUiMetadataSchema.safeParse(metadata);

	if (!success) {
		toasts.error({
			text: get(i18n).errors.invalid_metadata,
			detail: z.prettifyError(error)
		});
		return { success: false };
	}

	const updateMetadata = prepareMetadata({ data, currentMetadata });

	const payload = {
		satelliteId,
		metadata: updateMetadata,
		identity
	};

	const results = await Promise.all([
		setMetadataWithConsole(payload),
		...(nonNullish(missionControlId)
			? [
					setMetadataWithMissionControl({
						missionControlId,
						...payload
					})
				]
			: [])
	]);

	const hasError = results.find(({ result }) => result === 'error') !== undefined;

	return { success: !hasError };
};

const prepareMetadata = ({
	data,
	currentMetadata
}: {
	data: SatelliteUiMetadata;
	currentMetadata: Metadata;
}): Metadata => {
	const { name: satelliteName, environment: satelliteEnv, tags: satelliteTags } = data;

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

	return Array.from(updateData);
};

const setMetadataWithConsole = async ({
	satelliteId,
	metadata,
	identity
}: {
	satelliteId: SatelliteId;
	metadata: Metadata;
	identity: Identity;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	const currentState = get(segments);

	const isKeySatellite = (segmentKey: SegmentKey): boolean =>
		segmentKey.segment_id.toText() === satelliteId.toText() &&
		'Satellite' in segmentKey.segment_kind &&
		segmentKey.user.toText() === identity.getPrincipal().toText();

	const segment = currentState?.find(([segmentKey]) => isKeySatellite(segmentKey));

	// No segment found in the Console. Maybe it's a "legacy" segment that is "only" known by the Mission Control.
	if (isNullish(segment)) {
		return { result: 'skip' };
	}

	try {
		const updatedSegment = await setSegmentMetadata({
			segmentId: satelliteId,
			segmentKind: { Satellite: null },
			metadata,
			identity
		});

		const updateKey: SegmentKey = {
			segment_id: satelliteId,
			segment_kind: { Satellite: null },
			user: identity.getPrincipal()
		};

		const updateState = get(segments);
		segmentsUncertifiedStore.set([
			...(updateState ?? []).filter(([segmentKey]) => !isKeySatellite(segmentKey)),
			[updateKey, updatedSegment]
		]);

		return { result: 'success' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.satellite_metadata_update,
			detail: err
		});

		return { result: 'error' };
	}
};

const setMetadataWithMissionControl = async ({
	missionControlId,
	metadata,
	satelliteId,
	...rest
}: {
	missionControlId: MissionControlId;
	satelliteId: SatelliteId;
	metadata: Metadata;
	identity: Identity;
}): Promise<{ result: 'success' | 'warn' | 'error' }> => {
	const currentState = get(mctrlSatellitesStore);
	const satellite = currentState?.find(
		({ satellite_id }) => satellite_id.toText() === satelliteId.toText()
	);

	if (isNullish(satellite)) {
		toasts.warn(get(i18n).mission_control.warn_satellite_metadata_update);
		return { result: 'warn' };
	}

	try {
		const updatedSatellite = await setSatelliteMetadataApi({
			missionControlId,
			satelliteId,
			metadata,
			...rest
		});

		const updateState = get(mctrlSatellitesStore);
		satellitesUncertifiedStore.set([
			...(updateState ?? []).filter(
				({ satellite_id }) => updatedSatellite.satellite_id.toText() !== satellite_id.toText()
			),
			updatedSatellite
		]);

		return { result: 'success' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.satellite_metadata_update,
			detail: err
		});

		return { result: 'error' };
	}
};
