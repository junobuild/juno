import type { ICDid } from '$declarations';
import { canisterStatus, canisterUpdateSettings } from '$lib/api/ic.api';
import { MAX_NUMBER_OF_SATELLITE_CONTROLLERS } from '$lib/constants/canister.constants';
import { consoleOrbiters, consoleSatellites } from '$lib/derived/console/segments.derived';
import { i18n } from '$lib/stores/app/i18n.store';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Orbiter } from '$lib/types/orbiter';
import { type WizardCreateProgress, WizardCreateProgressStep } from '$lib/types/progress-wizard';
import type { Satellite } from '$lib/types/satellite';
import type { Option } from '$lib/types/utils';
import { toSetController } from '$lib/utils/controllers.utils';
import { container } from '$lib/utils/juno.utils';
import { assertNonNullish, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { setOrbiterControllers, setSatelliteControllers } from '@junobuild/admin';
import type { SatelliteDid } from '@junobuild/ic-client/actor';
import { get } from 'svelte/store';

type FinalizeMissionControlWizardResult = Promise<
	| {
			success: 'ok';
	  }
	| { success: 'warning'; canisterIds: Principal[] }
>;

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

	const step = WizardCreateProgressStep.Finalizing;

	onProgress({
		step,
		state: 'in_progress'
	});

	const result = await setMissionControlAsController({
		onTextProgress,
		identity,
		missionControlId
	});

	if (result.success === 'warning') {
		onProgress({
			step,
			state: 'warning'
		});

		return result;
	}

	// TODO: clean Console

	onProgress({
		step,
		state: 'success'
	});

	return result;
};

interface SetMissionControlAsControllerProgressStats {
	index: number;
	total: number;
}

const setMissionControlAsController = async ({
	onTextProgress,
	missionControlId,
	identity
}: {
	onTextProgress: (text: string) => void;
	missionControlId: MissionControlId;
	identity: Identity;
}): FinalizeMissionControlWizardResult => {
	const satellites = get(consoleSatellites) ?? [];
	const orbiters = get(consoleOrbiters) ?? [];

	let progress: SetMissionControlAsControllerProgressStats = {
		index: 1,
		total: satellites.length + orbiters.length
	};

	const onProgress = ({ index, total }: SetMissionControlAsControllerProgressStats) =>
		onTextProgress(`${get(i18n).mission_control.connecting} (${index} / ${total})...`);

	const updateProgress = ({ result }: { result: SetMissionControlControllerResult }) => {
		progress = {
			...progress,
			index: progress.index + 1
		};
	};

	const errorCanisterIds: Principal[] = [];

	for (const satellite of satellites) {
		onProgress(progress);

		const result = await setSatelliteController({
			satellite,
			missionControlId,
			identity
		});

		updateProgress({ result });

		if (result.result !== 'ok') {
			errorCanisterIds.push(satellite.satellite_id);
		}
	}

	for (const orbiter of orbiters) {
		onProgress(progress);

		const result = await setOrbiterController({
			orbiter,
			missionControlId,
			identity
		});

		updateProgress({ result });

		if (result.result !== 'ok') {
			errorCanisterIds.push(orbiter.orbiter_id);
		}
	}

	return errorCanisterIds.length === 0
		? { success: 'ok' }
		: { success: 'warning', canisterIds: errorCanisterIds };
};

const setSatelliteController = async ({
	satellite: { satellite_id: satelliteId },
	missionControlId,
	identity
}: {
	satellite: Satellite;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<SetMissionControlControllerResult> => {
	const setControllersFn: SetControllersFn = async ({ args }) => {
		await setSatelliteControllers({
			args,
			satellite: { satelliteId: satelliteId.toText(), identity, ...container() }
		});
	};

	return await setController({
		setControllersFn,
		canisterId: satelliteId,
		missionControlId,
		identity
	});
};

const setOrbiterController = async ({
	orbiter: { orbiter_id: orbiterId },
	missionControlId,
	identity
}: {
	orbiter: Orbiter;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<SetMissionControlControllerResult> => {
	const setControllersFn: SetControllersFn = async ({ args }) => {
		await setOrbiterControllers({
			args,
			orbiter: { orbiterId: orbiterId.toText(), identity, ...container() }
		});
	};

	await setController({
		setControllersFn,
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

type SetMissionControlControllerResult =
	| { result: 'ok' }
	| { result: 'reject'; reason: string }
	| { result: 'error'; err: unknown };

const setController = async ({
	setControllersFn,
	canisterId,
	missionControlId,
	identity
}: {
	setControllersFn: SetControllersFn;
	canisterId: Principal;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<SetMissionControlControllerResult> => {
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
