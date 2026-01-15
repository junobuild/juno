import { setManySegments } from '$lib/api/console.api';
import { consoleOrbiters, consoleSatellites } from '$lib/derived/console/segments.derived';
import { mctrlOrbiters } from '$lib/derived/mission-control/mission-control-orbiters.derived';
import { mctrlSatellites } from '$lib/derived/mission-control/mission-control-satellites.derived';
import { outOfSyncOrbiters, outOfSyncSatellites } from '$lib/derived/out-of-sync.derived';
import { execute } from '$lib/services/_progress.services';
import { attachWithMissionControl } from '$lib/services/attach-detach/_attach.mission-control.services';
import { loadSegments } from '$lib/services/segments.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Metadata } from '$lib/types/metadata';
import type { MissionControlId } from '$lib/types/mission-control';
import { type OutOfSyncProgress, OutOfSyncProgressStep } from '$lib/types/progress-out-of-sync';
import type { Option } from '$lib/types/utils';
import { isNullish, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

export const reconcileSegments = async ({
	identity,
	missionControlId,
	onProgress
}: {
	identity: OptionIdentity;
	missionControlId: Option<MissionControlId>;
	onProgress: (progress: OutOfSyncProgress | undefined) => void;
}): Promise<{ result: 'ok' } | { result: 'error'; err?: unknown }> => {
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

	if (missionControlId === null) {
		toasts.warn(get(i18n).errors.mission_control_not_found);
		return { result: 'error' };
	}

	const divergentSatellites = get(outOfSyncSatellites);
	const divergentOrbiters = get(outOfSyncOrbiters);

	if (divergentSatellites !== true && divergentOrbiters !== true) {
		toasts.warn(get(i18n).errors.reconcile_no_divergence);
		return { result: 'error' };
	}

	try {
		// Reconcile segments
		const reconcile = async () => {
			await reconcileAllSegments({
				identity,
				missionControlId
			});
		};
		await execute({ fn: reconcile, onProgress, step: OutOfSyncProgressStep.Sync });

		// Reload
		const reload = async () => {
			await loadSegments({
				missionControlId,
				reload: true,
				reloadOrbiters: true,
				reloadSatellites: true
			});
		};
		await execute({ fn: reload, onProgress, step: OutOfSyncProgressStep.Reload });

		return { result: 'ok' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.reconcile_out_of_sync_error,
			detail: err
		});

		return { result: 'error', err };
	}
};

const reconcileAllSegments = async ({
	identity,
	missionControlId
}: {
	identity: Identity;
	missionControlId: Principal;
}) => {
	await reconcileSatellites({
		identity,
		missionControlId
	});

	await reconcileOrbiters({
		identity,
		missionControlId
	});
};

const reconcileSatellites = async ({
	identity,
	missionControlId
}: {
	identity: Identity;
	missionControlId: Principal;
}) => {
	const consoleSats = get(consoleSatellites);
	const mctrlSats = get(mctrlSatellites);

	const attachConsoleSatellites = (mctrlSats ?? []).filter(
		({ satellite_id: segment_id }) =>
			(consoleSats ?? []).find(
				({ satellite_id }) => satellite_id.toText() === segment_id.toText()
			) === undefined
	);

	const attachMctrlSatellites = (consoleSats ?? []).filter(
		({ satellite_id: segment_id }) =>
			(mctrlSats ?? []).find(
				({ satellite_id }) => satellite_id.toText() === segment_id.toText()
			) === undefined
	);

	for (const { satellite_id: segmentId } of attachMctrlSatellites) {
		await attachWithMissionControl({ segment: 'satellite', segmentId, missionControlId, identity });
	}

	await attachWithConsole({
		identity,
		segments: attachConsoleSatellites.map(({ satellite_id, metadata }) => ({
			segmentId: satellite_id,
			segment: 'satellite',
			metadata
		}))
	});
};

const reconcileOrbiters = async ({
	identity,
	missionControlId
}: {
	identity: Identity;
	missionControlId: Principal;
}) => {
	const consoleOrbs = get(consoleOrbiters);
	const mctrlOrbs = get(mctrlOrbiters);

	const attachConsoleOrbiters = (mctrlOrbs ?? []).filter(
		({ orbiter_id: segment_id }) =>
			(consoleOrbs ?? []).find(({ orbiter_id }) => orbiter_id.toText() === segment_id.toText()) ===
			undefined
	);

	const attachMctrlOrbiters = (consoleOrbs ?? []).filter(
		({ orbiter_id: segment_id }) =>
			(mctrlOrbs ?? []).find(({ orbiter_id }) => orbiter_id.toText() === segment_id.toText()) ===
			undefined
	);

	for (const { orbiter_id: segmentId } of attachMctrlOrbiters) {
		await attachWithMissionControl({ segment: 'orbiter', segmentId, missionControlId, identity });
	}

	await attachWithConsole({
		identity,
		segments: attachConsoleOrbiters.map(({ orbiter_id, metadata }) => ({
			segmentId: orbiter_id,
			segment: 'orbiter',
			metadata
		}))
	});
};

interface AttachSegmentWithConsole {
	segment: 'satellite' | 'orbiter';
	segmentId: Principal;
	metadata: Metadata;
}

const attachWithConsole = async ({
	identity,
	segments
}: {
	identity: Identity;
	segments: AttachSegmentWithConsole[];
}) => {
	// We do the check for the lengths here. Not really graceful but,
	// avoid to duplicate the assertions for both Satellites and Orbiters
	if (segments.length === 0) {
		return;
	}

	await setManySegments({
		identity,
		args: segments.map(({ segmentId: segment_id, segment, metadata }) => ({
			segment_id,
			segment_kind: segment === 'orbiter' ? { Orbiter: null } : { Satellite: null },
			metadata: toNullable(metadata)
		}))
	});
};
