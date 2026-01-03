import { unsetSegment } from '$lib/api/console.api';
import { unsetOrbiter, unsetSatellite } from '$lib/api/mission-control.api';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Option } from '$lib/types/utils';
import { isNullish, nonNullish } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

interface DetachParams {
	identity: OptionIdentity;
	missionControlId: Option<MissionControlId>;
	monitoringEnabled: boolean;
	segment: 'satellite' | 'orbiter';
	segmentId: Principal;
}

export const detachSegment = async ({
	identity,
	missionControlId,
	monitoringEnabled,
	segment,
	segmentId
}: DetachParams): Promise<{ result: 'ok' | 'warn' } | { result: 'error'; err?: unknown }> => {
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

	// TODO: duplicate code
	// TODO: can be removed once the mission control is patched to disable monitoring on detach
	if (monitoringEnabled) {
		toasts.warn(get(i18n).monitoring.warn_monitoring_enabled);
		return { result: 'warn' };
	}

	try {
		if (nonNullish(missionControlId)) {
			await detachWithMissionControl({ segment, segmentId, missionControlId, identity });
		}

		await detachWithConsole({ segment, segmentId, identity });

		return { result: 'ok' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.segment_detach,
			detail: err
		});

		return { result: 'error', err };
	}
};

const detachWithConsole = async ({
	segment,
	segmentId: segment_id,
	identity
}: Pick<DetachParams, 'segment' | 'segmentId' | 'identity'>) => {
	await unsetSegment({
		identity,
		args: {
			segment_id,
			segment_type: segment === 'orbiter' ? { Orbiter: null } : { Satellite: null }
		}
	});
};

interface DetachWithMissionControlParams {
	missionControlId: MissionControlId;
	canisterId: Principal;
	identity: OptionIdentity;
}

const detachWithMissionControl = async ({
	segment,
	segmentId,
	...rest
}: Pick<DetachParams, 'segment' | 'segmentId' | 'identity'> & {
	missionControlId: MissionControlId;
}) => {
	const detachOrbiter = async ({ canisterId, ...rest }: DetachWithMissionControlParams) => {
		await unsetOrbiter({ ...rest, orbiterId: canisterId });
	};

	const detachSatellite = async ({
		canisterId,
		missionControlId,
		identity
	}: DetachWithMissionControlParams) => {
		await unsetSatellite({ missionControlId, satelliteId: canisterId, identity });
	};

	const fn = segment === 'orbiter' ? detachOrbiter : detachSatellite;

	await fn({
		...rest,
		canisterId: segmentId
	});
};
