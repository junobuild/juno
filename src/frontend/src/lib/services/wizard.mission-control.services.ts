import type { ICDid } from '$declarations';
import { canisterStatus, canisterUpdateSettings } from '$lib/api/ic.api';
import { MAX_NUMBER_OF_SATELLITE_CONTROLLERS } from '$lib/constants/canister.constants';
import { consoleOrbiters, consoleSatellites } from '$lib/derived/console/segments.derived';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Orbiter } from '$lib/types/orbiter';
import type { Satellite } from '$lib/types/satellite';
import { toSetController } from '$lib/utils/controllers.utils';
import { container } from '$lib/utils/juno.utils';
import { toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { setOrbiterControllers, setSatelliteControllers } from '@junobuild/admin';
import type { SatelliteDid } from '@junobuild/ic-client/actor';
import { get } from 'svelte/store';

export type SetMissionControlAsControllerOnProgress = (
	params: SetMissionControlAsControllerProgressStats
) => void;

export interface SetMissionControlAsControllerProgressStats {
	index: number;
	total: number;
	successes: number;
	errors: number;
	results: SetMissionControlControllerResult[];
}

export const setMissionControlAsController = async ({
	onProgress,
	missionControlId,
	identity
}: {
	onProgress: SetMissionControlAsControllerOnProgress;
	missionControlId: MissionControlId;
	identity: Identity;
}) => {
	const satellites = get(consoleSatellites) ?? [];
	const orbiters = get(consoleOrbiters) ?? [];

	let progress: SetMissionControlAsControllerProgressStats = {
		index: 1,
		successes: 0,
		errors: 0,
		total: satellites.length + orbiters.length,
		results: []
	};

	const updateProgress = ({ result }: { result: SetMissionControlControllerResult }) => {
		progress = {
			...progress,
			index: progress.index + 1,
			successes: progress.successes + (result.result === 'ok' ? 1 : 0),
			errors: progress.errors + (result.result !== 'ok' ? 1 : 0),
			results: [...progress.results, result]
		};
	};

	for (const satellite of satellites) {
		onProgress(progress);

		const result = await setSatelliteController({
			satellite,
			missionControlId,
			identity
		});

		updateProgress({ result });
	}

	for (const orbiter of orbiters) {
		onProgress(progress);

		const result = await setOrbiterController({
			orbiter,
			missionControlId,
			identity
		});

		updateProgress({ result });
	}
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

	await setController({
		setControllersFn,
		canisterId: satelliteId,
		missionControlId,
		identity
	});

	return { result: 'ok' };
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

type SetControllersFnParams = { args: SatelliteDid.SetControllersArgs };
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

	// TODO: label
	if (currentControllers.length >= MAX_NUMBER_OF_SATELLITE_CONTROLLERS - 1) {
		return { result: 'reject', reason: 'Max 10 controllers' };
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
