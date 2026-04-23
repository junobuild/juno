import type { MissionControlDid } from '$declarations';
import type { SegmentKey } from '$declarations/console/console.did';
import { setSegmentMetadata } from '$lib/api/console.api';
import {
	setSatelliteMetadata as setSatelliteMetadataApi,
	setUfoMetadata as setUfoMetadataApi
} from '$lib/api/mission-control.api';
import {
	METADATA_KEY_ENVIRONMENT,
	METADATA_KEY_NAME,
	METADATA_KEY_TAGS
} from '$lib/constants/metadata.constants';
import { segments } from '$lib/derived/console/segments.derived';
import { mctrlSatellites } from '$lib/derived/mission-control/mission-control-satellites.derived';
import { mctrlUfos } from '$lib/derived/mission-control/mission-control-ufos.derived';
import { MetadataSerializer, MetadataUiSchema } from '$lib/schemas/metadata.schema';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { segmentsUncertifiedStore } from '$lib/stores/console/segments.store';
import { satellitesUncertifiedStore } from '$lib/stores/mission-control/satellites.store';
import { ufosUncertifiedStore } from '$lib/stores/mission-control/ufos.store';
import type { NullishIdentity } from '$lib/types/itentity';
import type { Metadata, MetadataUi } from '$lib/types/metadata';
import type { MissionControlId } from '$lib/types/mission-control';
import type { SatelliteId } from '$lib/types/satellite';
import type { UfoId } from '$lib/types/ufo';
import { isNullish, nonNullish, notEmptyString } from '@dfinity/utils';
import type { Nullish } from '@dfinity/zod-schemas';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';
import * as z from 'zod';

export interface SetMetadataParams {
	missionControlId: Nullish<MissionControlId>;
	metadata: MetadataUi;
	identity: NullishIdentity;
}

export interface SetMetadataResult {
	success: boolean;
}

interface SetSatelliteMetadataParams extends SetMetadataParams {
	satellite: MissionControlDid.Satellite;
}

interface SetUfoMetadataParams extends SetMetadataParams {
	ufo: MissionControlDid.Ufo;
}

export const setSatelliteMetadata = async ({
	missionControlId,
	satellite: { satellite_id: satelliteId, metadata: currentMetadata },
	metadata,
	identity
}: SetSatelliteMetadataParams): Promise<SetMetadataResult> => {
	// TODO: indentity check service
	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: get(i18n).core.not_logged_in });
		return { success: false };
	}

	const { error, success, data } = MetadataUiSchema.safeParse(metadata);

	if (!success) {
		toasts.error({
			text: get(i18n).errors.invalid_metadata,
			detail: z.prettifyError(error)
		});
		return { success: false };
	}

	const updateMetadata = prepareMetadata({ data, currentMetadata });

	const payload = {
		metadata: updateMetadata,
		identity
	};

	const results = await Promise.all([
		setMetadataWithConsole({
			...payload,
			segmentId: satelliteId,
			segmentKindText: 'Satellite'
		}),
		...(nonNullish(missionControlId)
			? [
					setSatelliteMetadataWithMissionControl({
						missionControlId,
						satelliteId,
						...payload
					})
				]
			: [])
	]);

	const hasError = results.find(({ result }) => result === 'error') !== undefined;

	return { success: !hasError };
};

export const setUfoMetadata = async ({
	missionControlId,
	ufo: { ufo_id: ufoId, metadata: currentMetadata },
	metadata,
	identity
}: SetUfoMetadataParams): Promise<SetMetadataResult> => {
	// TODO: indentity check service
	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: get(i18n).core.not_logged_in });
		return { success: false };
	}

	const { error, success, data } = MetadataUiSchema.safeParse(metadata);

	if (!success) {
		toasts.error({
			text: get(i18n).errors.invalid_metadata,
			detail: z.prettifyError(error)
		});
		return { success: false };
	}

	const updateMetadata = prepareMetadata({ data, currentMetadata });

	const payload = {
		metadata: updateMetadata,
		identity
	};

	const results = await Promise.all([
		setMetadataWithConsole({
			...payload,
			segmentId: ufoId,
			segmentKindText: 'Ufo'
		}),
		...(nonNullish(missionControlId)
			? [
					setUfoMetadataWithMissionControl({
						missionControlId,
						ufoId,
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
	data: MetadataUi;
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

	const tags = MetadataSerializer.parse(satelliteTags);

	if (notEmptyString(tags)) {
		updateData.set(METADATA_KEY_TAGS, tags);
	} else {
		updateData.delete(METADATA_KEY_TAGS);
	}

	return Array.from(updateData);
};

const setMetadataWithConsole = async ({
	segmentId,
	segmentKindText,
	metadata,
	identity
}: {
	segmentId: Principal;
	segmentKindText: 'Satellite' | 'Ufo';
	metadata: Metadata;
	identity: Identity;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	const currentState = get(segments);

	const isKeySegment = (segmentKey: SegmentKey): boolean =>
		segmentKey.segment_id.toText() === segmentId.toText() &&
		segmentKindText in segmentKey.segment_kind &&
		segmentKey.user.toText() === identity.getPrincipal().toText();

	const segment = currentState?.find(([segmentKey]) => isKeySegment(segmentKey));

	// No segment found in the Console. Maybe it's a "legacy" segment that is "only" known by the Mission Control.
	if (isNullish(segment)) {
		return { result: 'skip' };
	}

	try {
		const segmentKind = segmentKindText === 'Ufo' ? { Ufo: null } : { Satellite: null };

		const updatedSegment = await setSegmentMetadata({
			segmentId,
			segmentKind,
			metadata,
			identity
		});

		const updateKey: SegmentKey = {
			segment_id: segmentId,
			segment_kind: segmentKind,
			user: identity.getPrincipal()
		};

		const updateState = get(segments);
		segmentsUncertifiedStore.set([
			...(updateState ?? []).filter(([segmentKey]) => !isKeySegment(segmentKey)),
			[updateKey, updatedSegment]
		]);

		return { result: 'success' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.update_metadata_error,
			detail: err
		});

		return { result: 'error' };
	}
};

const setSatelliteMetadataWithMissionControl = async ({
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
	const currentState = get(mctrlSatellites);
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

		const updateState = get(mctrlSatellites);
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

const setUfoMetadataWithMissionControl = async ({
	missionControlId,
	metadata,
	ufoId,
	...rest
}: {
	missionControlId: MissionControlId;
	ufoId: UfoId;
	metadata: Metadata;
	identity: Identity;
}): Promise<{ result: 'success' | 'warn' | 'error' }> => {
	const currentState = get(mctrlUfos);
	const ufo = currentState?.find(({ ufo_id }) => ufo_id.toText() === ufoId.toText());

	if (isNullish(ufo)) {
		toasts.warn(get(i18n).mission_control.warn_ufo_metadata_update);
		return { result: 'warn' };
	}

	try {
		const updatedUfo = await setUfoMetadataApi({
			missionControlId,
			ufoId,
			metadata,
			...rest
		});

		const updateState = get(mctrlUfos);
		ufosUncertifiedStore.set([
			...(updateState ?? []).filter(({ ufo_id }) => updatedUfo.ufo_id.toText() !== ufo_id.toText()),
			updatedUfo
		]);

		return { result: 'success' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.ufo_metadata_update,
			detail: err
		});

		return { result: 'error' };
	}
};
