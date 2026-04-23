import { setManySegments } from '$lib/api/console.api';
import {
	consoleOrbiters,
	consoleSatellites,
	consoleUfos
} from '$lib/derived/console/segments.derived';
import { mctrlOrbiters } from '$lib/derived/mission-control/mission-control-orbiters.derived';
import { mctrlSatellites } from '$lib/derived/mission-control/mission-control-satellites.derived';
import { mctrlUfos } from '$lib/derived/mission-control/mission-control-ufos.derived';
import {
	outOfSyncOrbiters,
	outOfSyncSatellites,
	outOfSyncUfos
} from '$lib/derived/out-of-sync.derived';
import { execute } from '$lib/services/_progress.services';
import {
	setMissionControlAsControllerAndAttachOrbiter,
	setMissionControlAsControllerAndAttachSatellite,
	setMissionControlAsControllerAndAttachUfo
} from '$lib/services/factory/_factory.attach.services';
import { loadSegments } from '$lib/services/segments.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { NullishIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Orbiter } from '$lib/types/orbiter';
import { type OutOfSyncProgress, OutOfSyncProgressStep } from '$lib/types/progress-out-of-sync';
import type { Satellite } from '$lib/types/satellite';
import type { Ufo } from '$lib/types/ufo';
import { isNullish, toNullable } from '@dfinity/utils';
import type { Nullish } from '@dfinity/zod-schemas';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

export const reconcileSegments = async ({
	identity,
	missionControlId,
	onProgress,
	onSyncTextProgress
}: {
	identity: NullishIdentity;
	missionControlId: Nullish<MissionControlId>;
	onProgress: (progress: OutOfSyncProgress | undefined) => void;
	onSyncTextProgress: (text: string) => void;
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
	const divergentUfos = get(outOfSyncUfos);

	if (divergentSatellites !== true && divergentOrbiters !== true && divergentUfos !== true) {
		toasts.warn(get(i18n).errors.reconcile_no_divergence);
		return { result: 'error' };
	}

	try {
		// Reconcile segments
		const reconcile = async () => {
			await reconcileAllSegments({
				identity,
				missionControlId,
				onTextProgress: onSyncTextProgress
			});
		};
		await execute({ fn: reconcile, onProgress, step: OutOfSyncProgressStep.Sync });

		// Reload
		const reload = async () => {
			await loadSegments({
				missionControlId,
				reload: true,
				reloadOrbiters: true,
				reloadSatellites: true,
				reloadUfos: true
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

interface ReconcileParams {
	identity: Identity;
	missionControlId: Principal;
	onTextProgress: (text: string) => void;
}

const reconcileAllSegments = async (params: ReconcileParams) => {
	await reconcileSatellites(params);

	await reconcileOrbiters(params);

	await reconcileUfos(params);
};

const reconcileSatellites = async ({
	identity,
	missionControlId,
	onTextProgress
}: ReconcileParams) => {
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

	type SegmentWithoutId = Omit<Satellite, 'satellite_id'>;

	const attachFn: AttachFn<SegmentWithoutId> = async ({ segment: { segmentId, ...rest } }) => {
		await setMissionControlAsControllerAndAttachSatellite({
			missionControlId,
			identity,
			satellite: {
				satellite_id: segmentId,
				...rest
			}
		});
	};

	await attachWithMissionControl<SegmentWithoutId>({
		onTextProgress,
		segmentType: 'satellite',
		segments: attachMctrlSatellites.map(({ satellite_id: segmentId, ...rest }) => ({
			...rest,
			segmentId
		})),
		attachFn
	});

	await attachWithConsole({
		identity,
		onTextProgress,
		segmentType: 'satellite',
		segments: attachConsoleSatellites.map(({ satellite_id, metadata }) => ({
			segmentId: satellite_id,
			metadata
		}))
	});
};

const reconcileOrbiters = async ({
	identity,
	missionControlId,
	onTextProgress
}: ReconcileParams) => {
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

	type SegmentWithoutId = Omit<Orbiter, 'orbiter_id'>;

	const attachFn: AttachFn<SegmentWithoutId> = async ({ segment: { segmentId, ...rest } }) => {
		await setMissionControlAsControllerAndAttachOrbiter({
			missionControlId,
			identity,
			orbiter: {
				orbiter_id: segmentId,
				...rest
			}
		});
	};

	await attachWithMissionControl<SegmentWithoutId>({
		onTextProgress,
		segmentType: 'satellite',
		segments: attachMctrlOrbiters.map(({ orbiter_id: segmentId, ...rest }) => ({
			...rest,
			segmentId
		})),
		attachFn
	});

	await attachWithConsole({
		identity,
		onTextProgress,
		segmentType: 'orbiter',
		segments: attachConsoleOrbiters.map(({ orbiter_id, metadata }) => ({
			segmentId: orbiter_id,
			metadata
		}))
	});
};

const reconcileUfos = async ({ identity, missionControlId, onTextProgress }: ReconcileParams) => {
	const consoleUfs = get(consoleUfos);
	const mctrlUfs = get(mctrlUfos);

	const attachConsoleUfos = (mctrlUfs ?? []).filter(
		({ ufo_id: segment_id }) =>
			(consoleUfs ?? []).find(({ ufo_id }) => ufo_id.toText() === segment_id.toText()) === undefined
	);

	const attachMctrlUfos = (consoleUfs ?? []).filter(
		({ ufo_id: segment_id }) =>
			(mctrlUfs ?? []).find(({ ufo_id }) => ufo_id.toText() === segment_id.toText()) === undefined
	);

	type SegmentWithoutId = Omit<Ufo, 'ufo_id'>;

	const attachFn: AttachFn<SegmentWithoutId> = async ({ segment: { segmentId, ...rest } }) => {
		await setMissionControlAsControllerAndAttachUfo({
			missionControlId,
			identity,
			ufo: {
				ufo_id: segmentId,
				...rest
			}
		});
	};

	await attachWithMissionControl<SegmentWithoutId>({
		onTextProgress,
		segmentType: 'ufo',
		segments: attachMctrlUfos.map(({ ufo_id: segmentId, ...rest }) => ({
			...rest,
			segmentId
		})),
		attachFn
	});

	await attachWithConsole({
		identity,
		onTextProgress,
		segmentType: 'ufo',
		segments: attachConsoleUfos.map(({ ufo_id, metadata }) => ({
			segmentId: ufo_id,
			metadata
		}))
	});
};

type SegmentWithoutId = Omit<Satellite, 'satellite_id'> | Omit<Orbiter, 'orbiter_id'>;

type AttachSegment<T extends SegmentWithoutId> = {
	segmentId: Principal;
} & T;

interface AttachWithMissionControlProgressStats {
	index: number;
	total: number;
}

type AttachFn<T extends SegmentWithoutId> = (params: {
	segment: AttachSegment<T>;
}) => Promise<void>;

const attachWithMissionControl = async <T extends SegmentWithoutId>({
	onTextProgress,
	segments,
	segmentType,
	attachFn
}: Pick<ReconcileParams, 'onTextProgress'> & {
	segments: AttachSegment<T>[];
	segmentType: 'satellite' | 'orbiter' | 'ufo';
	attachFn: AttachFn<T>;
}) => {
	// We do the check for the lengths here. Not really graceful but,
	// avoid to duplicate the assertions for both Satellites and Orbiters
	if (segments.length === 0) {
		return;
	}

	let progress: AttachWithMissionControlProgressStats = {
		index: 0,
		total: segments.length
	};

	const incrementProgress = () => {
		progress = {
			...progress,
			index: progress.index + 1
		};

		const text =
			segmentType === 'ufo'
				? get(i18n).out_of_sync.syncing_ufos_to_mctrl
				: segmentType === 'orbiter'
					? get(i18n).out_of_sync.syncing_orbiters_to_mctrl
					: get(i18n).out_of_sync.syncing_satellites_to_mctrl;

		onTextProgress(text.replace('{0}', `${progress.index} / ${progress.total}`));
	};

	for (const segment of segments) {
		incrementProgress();

		await attachFn({ segment });
	}
};

const attachWithConsole = async <T extends SegmentWithoutId>({
	identity,
	onTextProgress,
	segments,
	segmentType
}: {
	segments: Pick<AttachSegment<T>, 'segmentId' | 'metadata'>[];
	segmentType: 'satellite' | 'orbiter' | 'ufo';
} & Pick<ReconcileParams, 'identity' | 'onTextProgress'>) => {
	// We do the check for the lengths here. Not really graceful but,
	// avoid to duplicate the assertions for both Satellites and Orbiters
	if (segments.length === 0) {
		return;
	}

	const text =
		segmentType === 'ufo'
			? get(i18n).out_of_sync.syncing_ufos_to_console
			: segmentType === 'orbiter'
				? get(i18n).out_of_sync.syncing_orbiters_to_console
				: get(i18n).out_of_sync.syncing_satellites_to_console;

	onTextProgress(text);

	await setManySegments({
		identity,
		args: segments.map(({ segmentId: segment_id, metadata }) => ({
			segment_id,
			segment_kind:
				segmentType === 'ufo'
					? { Ufo: null }
					: segmentType === 'orbiter'
						? { Orbiter: null }
						: { Satellite: null },
			metadata: toNullable(metadata)
		}))
	});
};
