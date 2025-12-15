import type { ICDid } from '$declarations';
import { canisterStatus, canisterUpdateSettings } from '$lib/api/ic.api';
import { MAX_NUMBER_OF_SATELLITE_CONTROLLERS } from '$lib/constants/canister.constants';
import { consoleSatellites } from '$lib/derived/console/segments.derived';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Satellite } from '$lib/types/satellite';
import { toSetController } from '$lib/utils/controllers.utils';
import { container } from '$lib/utils/juno.utils';
import { toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { setSatelliteControllers } from '@junobuild/admin';
import { get } from 'svelte/store';

export const setMissionControlAsController = async () => {
	const satellites = get(consoleSatellites);
};

const setSatelliteController = async ({
	satellite: { satellite_id: satelliteId },
	missionControlId,
	identity
}: {
	satellite: Satellite;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<{ result: 'ok' } | { result: 'error'; reason: string }> => {
	const result = await setIcMgmtController({
		missionControlId,
		identity,
		canisterId: satelliteId
	});

	if (result.result === 'error') {
		return result;
	}

	await setSatelliteControllers({
		args: {
			controller: toSetController({
				profile: undefined,
				scope: 'admin'
			}),
			controllers: [missionControlId]
		},
		satellite: { satelliteId: satelliteId.toText(), identity, ...container() }
	});

	return {result: 'ok'};
};

const setIcMgmtController = async ({
	canisterId,
	missionControlId,
	identity
}: {
	canisterId: Principal;
	missionControlId: MissionControlId;
	identity: Identity;
}): Promise<{ result: 'ok' | 'skip' } | { result: 'error'; reason: string }> => {
	const {
		settings: { controllers: currentControllers }
	} = await canisterStatus({
		identity,
		canisterId: canisterId.toText()
	});

	// TODO: label
	if (currentControllers.length >= MAX_NUMBER_OF_SATELLITE_CONTROLLERS - 1) {
		return { result: 'error', reason: 'Max 10 controllers' };
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
