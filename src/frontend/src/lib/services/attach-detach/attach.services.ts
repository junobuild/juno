import { setSegment } from '$lib/api/console.api';
import { setOrbiter, setSatellite } from '$lib/api/mission-control.api';
import { loadSegments } from '$lib/services/segments.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Option } from '$lib/types/utils';
import { isNullish, nonNullish, toNullable } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

interface AttachParams {
	identity: OptionIdentity;
	missionControlId: Option<MissionControlId>;
	segment: 'satellite' | 'orbiter';
	segmentId: Principal;
}

export const attachSegment = async ({
	identity,
	missionControlId,
	segment,
	segmentId
}: AttachParams): Promise<{ result: 'ok' } | { result: 'error'; err?: unknown }> => {
	// TODO: duplicate code
	if (missionControlId === undefined) {
		toasts.warn(get(i18n).errors.mission_control_not_loaded);
		return { result: 'error' };
	}

	// TODO: indentity check service
	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: get(i18n).core.not_logged_in });
		return { result: 'error' };
	}

	try {
		// TODO: assertion

		if (nonNullish(missionControlId)) {
			await attachWithMissionControl({ segment, segmentId, missionControlId, identity });
		}

		await attachWithConsole({ segment, segmentId, identity });

		return { result: 'ok' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.canister_attach_error,
			detail: err
		});

		return { result: 'error', err };
	} finally {
		await loadSegments({
			missionControlId,
			reload: true,
			reloadSatellites: segment === 'satellite',
			reloadOrbiters: segment === 'orbiter'
		});
	}
};

interface AttachWithMissionControlParams {
	missionControlId: MissionControlId;
	canisterId: Principal;
	identity: OptionIdentity;
}

const attachWithConsole = async ({
	segment,
	segmentId: segment_id,
	identity
}: Pick<AttachParams, 'segment' | 'segmentId' | 'identity'>) => {
	await setSegment({
		identity,
		args: {
			segment_id,
			segment_type: segment === 'orbiter' ? { Orbiter: null } : { Satellite: null },
			metadata: toNullable()
		}
	});
};

const attachWithMissionControl = async ({
	segment,
	segmentId,
	...rest
}: Pick<AttachParams, 'segment' | 'segmentId' | 'identity'> & {
	missionControlId: MissionControlId;
}) => {
	const attachOrbiter = async ({ canisterId, ...rest }: AttachWithMissionControlParams) => {
		await setOrbiter({ ...rest, orbiterId: canisterId });
	};

	const attachSatellite = async ({
		canisterId,
		missionControlId,
		identity
	}: AttachWithMissionControlParams) => {
		await setSatellite({ missionControlId, satelliteId: canisterId, identity });
	};

	const fn = segment === 'orbiter' ? attachOrbiter : attachSatellite;

	await fn({
		...rest,
		canisterId: segmentId
	});
};
