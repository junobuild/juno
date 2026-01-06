import { setSegment } from '$lib/api/console.api';
import { setOrbiter, setSatellite } from '$lib/api/mission-control.api';
import { loadSegments } from '$lib/services/segments.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Option } from '$lib/types/utils';
import { i18nCapitalize, i18nFormat } from '$lib/utils/i18n.utils';
import { container } from '$lib/utils/juno.utils';
import { isNullish, nonNullish, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { orbiterVersion, satelliteVersion } from '@junobuild/admin';
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

	const { valid } = await assertKnowSegmentType({ segment, segmentId, identity });

	if (!valid) {
		return { result: 'error' };
	}

	try {
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

/**
 * Not bullet-proof but, this gives us a hint the developer did not mistakenly enters
 * the incorrect ID or selected the incorrect segment type.
 */
const assertKnowSegmentType = async ({
	segment,
	segmentId,
	identity
}: Pick<AttachParams, 'segment' | 'segmentId'> & { identity: Identity }): Promise<{
	valid: boolean;
}> => {
	const assertSatellite = async () => {
		await satelliteVersion({
			satellite: { satelliteId: segmentId.toText(), identity, ...container() }
		});
	};

	const assertOrbiter = async () => {
		await orbiterVersion({
			orbiter: { orbiterId: segmentId.toText(), identity, ...container() }
		});
	};

	try {
		// "old" modules won't throw an error as the version checks fallback on the deprecated
		// version() end point. For simplicity reasons, we are cool with it. Anyway, this is just a
		// nice friendly check.
		const fn = segment === 'orbiter' ? assertOrbiter : assertSatellite;
		await fn();

		return { valid: true };
	} catch {
		toasts.error({
			text: i18nFormat(get(i18n).errors.canister_cannot_attach, [
				{
					placeholder: '{0}',
					value: i18nCapitalize(segment)
				}
			])
		});

		return { valid: false };
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
			segment_kind: segment === 'orbiter' ? { Orbiter: null } : { Satellite: null },
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
