import type { ICDid } from '$declarations';
import { unsetManySegments } from '$lib/api/console.api';
import { canisterStatus, canisterUpdateSettings } from '$lib/api/ic.api';
import { setOrbiter, setSatellite } from '$lib/api/mission-control.api';
import { MAX_NUMBER_OF_SATELLITE_CONTROLLERS } from '$lib/constants/canister.constants';
import { consoleOrbiters, consoleSatellites } from '$lib/derived/console/segments.derived';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Orbiter } from '$lib/types/orbiter';
import { type WizardCreateProgress, WizardCreateProgressStep } from '$lib/types/progress-wizard';
import type { Satellite } from '$lib/types/satellite';
import type { Option } from '$lib/types/utils';
import { toSetController } from '$lib/utils/controllers.utils';
import { container } from '$lib/utils/juno.utils';
import { waitForMilliseconds } from '$lib/utils/timeout.utils';
import { assertNonNullish, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { setOrbiterControllers, setSatelliteControllers } from '@junobuild/admin';
import type { SatelliteDid } from '@junobuild/ic-client/actor';
import { get } from 'svelte/store';

type FinalizeMissionControlWizardResult = Promise<{ success: 'ok' } | { success: 'warning' }>;

export const finalizeMissionControlWizard = async ({
	onProgress,
	onTextProgress,
	missionControlId,
	identity
}: {
	onProgress: (progress: WizardCreateProgress | undefined) => void;
	onTextProgress: (text: string) => void;
	missionControlId: MissionControlId;
	identity: Option<Identity>;
}): Promise<FinalizeMissionControlWizardResult> => {
	assertNonNullish(identity, get(i18n).core.not_logged_in);

	onProgress({
		step: WizardCreateProgressStep.Attaching,
		state: 'in_progress'
	});

	const { satellites, orbiters } = await setMissionControlAsControllerAndAttach({
		onTextProgress,
		identity,
		missionControlId
	});

	const errors = [...satellites.errors, ...orbiters.errors];

	if (errors.length > 0) {
		toasts.error({
			text: `${get(i18n).mission_control.warn_attaching} ${errors.map((id) => id.toText()).join(',')}`,
			level: 'warn'
		});
	}

	onProgress({
		step: WizardCreateProgressStep.Attaching,
		state: errors.length > 0 ? 'warning' : 'success'
	});

	// Small delay to rerender the UI
	await waitForMilliseconds(500);

	onProgress({
		step: WizardCreateProgressStep.Finalizing,
		state: 'in_progress'
	});

	const unsetResults = await unsetSegments({
		identity,
		satelliteIds: satellites.successes,
		orbiterIds: orbiters.successes
	});

	if (unsetResults.success === 'error') {
		toasts.error({
			text: get(i18n).mission_control.warn_finalizing,
			level: 'warn',
			detail: unsetResults.err
		});
	}

	onProgress({
		step: WizardCreateProgressStep.Finalizing,
		state: unsetResults.success === 'error' ? 'warning' : 'success'
	});

	const withErrors = errors.length > 0 || unsetResults.success === 'error';
	return { success: withErrors ? 'warning' : 'ok' };
};

interface SetMissionControlAsControllerProgressStats {
	index: number;
	total: number;
}

const setMissionControlAsControllerAndAttach = async ({
	onTextProgress,
	missionControlId,
	identity
}: {
	onTextProgress: (text: string) => void;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<{ satellites: AttachCanistersResult; orbiters: AttachCanistersResult }> => {
	const satellites = get(consoleSatellites) ?? [];
	const orbiters = get(consoleOrbiters) ?? [];

	let progress: SetMissionControlAsControllerProgressStats = {
		index: 0,
		total: satellites.length + orbiters.length
	};

	const incrementProgress = () => {
		progress = {
			...progress,
			index: progress.index + 1
		};

		onTextProgress(
			`${get(i18n).mission_control.attaching} (${progress.index} / ${progress.total})`
		);
	};

	const attachedSatellites = await attachSatellites({
		satellites,
		missionControlId,
		identity,
		incrementProgress
	});
	const attachedOrbiters = await attachOrbiters({
		orbiters,
		missionControlId,
		identity,
		incrementProgress
	});

	return {
		satellites: attachedSatellites,
		orbiters: attachedOrbiters
	};
};

const unsetSegments = async ({
	satelliteIds,
	orbiterIds,
	identity
}: {
	satelliteIds: Principal[];
	orbiterIds: Principal[];
	identity: Identity;
}): Promise<{ success: 'ok' } | { success: 'error'; err: unknown }> => {
	try {
		const unsetSatellites = async () =>
			await unsetManySegments({
				segments: satelliteIds.map((satelliteId) => [satelliteId, { Satellite: null }]),
				identity
			});

		const unsetOrbiters = async () =>
			await unsetManySegments({
				segments: orbiterIds.map((orbiterId) => [orbiterId, { Orbiter: null }]),
				identity
			});

		const promises = [
			...(satelliteIds.length > 0 ? [unsetSatellites()] : []),
			...(orbiterIds.length > 0 ? [unsetOrbiters()] : [])
		];

		await Promise.all(promises);

		return { success: 'ok' };
	} catch (err: unknown) {
		return { success: 'error', err };
	}
};

interface AttachCanistersResult {
	errors: Principal[];
	successes: Principal[];
}

// TODO: missing names
// TODO: reload segments

const attachSatellites = async ({
	satellites,
	incrementProgress,
	missionControlId,
	identity
}: {
	satellites: Satellite[];
	incrementProgress: () => void;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<AttachCanistersResult> => {
	const canisterIds: AttachCanistersResult = { errors: [], successes: [] };

	for (const satellite of satellites) {
		incrementProgress();

		const result = await attachSatellite({
			satellite,
			missionControlId,
			identity
		});

		if (result.result !== 'ok') {
			canisterIds.errors.push(satellite.satellite_id);
		} else {
			canisterIds.successes.push(satellite.satellite_id);
		}
	}

	return canisterIds;
};

const attachOrbiters = async ({
	orbiters,
	incrementProgress,
	missionControlId,
	identity
}: {
	orbiters: Orbiter[];
	incrementProgress: () => void;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<AttachCanistersResult> => {
	const canisterIds: AttachCanistersResult = { errors: [], successes: [] };

	for (const orbiter of orbiters) {
		incrementProgress();

		const result = await attachOrbiter({
			orbiter,
			missionControlId,
			identity
		});

		if (result.result !== 'ok') {
			canisterIds.errors.push(orbiter.orbiter_id);
		} else {
			canisterIds.successes.push(orbiter.orbiter_id);
		}
	}

	return canisterIds;
};

const attachSatellite = async ({
	satellite: { satellite_id: satelliteId },
	missionControlId,
	identity
}: {
	satellite: Satellite;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<AttachSegmentResult> => {
	const setControllersFn: SetControllersFn = async ({ args }) => {
		await setSatelliteControllers({
			args,
			satellite: { satelliteId: satelliteId.toText(), identity, ...container() }
		});
	};

	const attachFn = async () => {
		await setSatellite({ missionControlId, satelliteId, identity });
	};

	return await setControllerAndAttach({
		setControllersFn,
		attachFn,
		canisterId: satelliteId,
		missionControlId,
		identity
	});
};

const attachOrbiter = async ({
	orbiter: { orbiter_id: orbiterId },
	missionControlId,
	identity
}: {
	orbiter: Orbiter;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<AttachSegmentResult> => {
	const setControllersFn: SetControllersFn = async ({ args }) => {
		await setOrbiterControllers({
			args,
			orbiter: { orbiterId: orbiterId.toText(), identity, ...container() }
		});
	};

	const attachFn = async () => {
		await setOrbiter({ missionControlId, orbiterId, identity });
	};

	await setControllerAndAttach({
		setControllersFn,
		attachFn,
		canisterId: orbiterId,
		missionControlId,
		identity
	});

	return { result: 'ok' };
};

interface SetControllersFnParams {
	args: SatelliteDid.SetControllersArgs;
}
type SetControllersFn = (params: SetControllersFnParams) => Promise<void>;

type AttachSegmentResult =
	| { result: 'ok' }
	| { result: 'reject'; reason: string }
	| { result: 'error'; err: unknown };

const setControllerAndAttach = async ({
	setControllersFn,
	attachFn,
	canisterId,
	missionControlId,
	identity
}: {
	setControllersFn: SetControllersFn;
	attachFn: () => Promise<void>;
	canisterId: Principal;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<AttachSegmentResult> => {
	try {
		const result = await setIcMgmtController({
			missionControlId,
			identity,
			canisterId
		});

		if (result.result === 'reject') {
			return result;
		}

		await setControllersFn({
			args: {
				controller: toSetController({
					profile: undefined,
					scope: 'admin'
				}),
				controllers: [missionControlId]
			}
		});

		await attachFn();

		return { result: 'ok' };
	} catch (err: unknown) {
		return { result: 'error', err };
	}
};

const setIcMgmtController = async ({
	canisterId,
	missionControlId,
	identity
}: {
	canisterId: Principal;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<{ result: 'ok' | 'skip' } | { result: 'reject'; reason: string }> => {
	const {
		settings: { controllers: currentControllers }
	} = await canisterStatus({
		identity,
		canisterId: canisterId.toText()
	});

	if (currentControllers.length >= MAX_NUMBER_OF_SATELLITE_CONTROLLERS - 1) {
		return { result: 'reject', reason: get(i18n).errors.canister_controllers };
	}

	const alreadySet =
		currentControllers.find((id) => id.toText() === canisterId.toText()) !== undefined;
	if (alreadySet) {
		return { result: 'skip' };
	}

	const updateSettings: ICDid.canister_settings = {
		environment_variables: toNullable(),
		compute_allocation: toNullable(),
		freezing_threshold: toNullable(),
		log_visibility: toNullable(),
		memory_allocation: toNullable(),
		reserved_cycles_limit: toNullable(),
		wasm_memory_limit: toNullable(),
		wasm_memory_threshold: toNullable(),
		controllers: toNullable([...currentControllers, missionControlId])
	};

	await canisterUpdateSettings({
		canisterId,
		identity,
		settings: updateSettings
	});

	return { result: 'ok' };
};
