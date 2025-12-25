import type { MissionControlDid } from '$declarations';
import { getMissionControlActor } from '$lib/api/actors/actor.juno.api';
import { loadDataStore } from '$lib/services/_loader.services';
import { authStore } from '$lib/stores/auth.store';
import { satellitesUncertifiedStore } from '$lib/stores/mission-control/satellites.store';
import type { CreateSatelliteConfig } from '$lib/types/factory';
import type { Option } from '$lib/types/utils';
import { assertNonNullish, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

/**
 * @deprecated use createSatelliteWithConfig
 */
export const createSatellite = async ({
	identity,
	missionControlId,
	config: { name }
}: {
	identity: Option<Identity>;
	missionControlId: Option<Principal>;
	config: Required<Pick<CreateSatelliteConfig, 'name'>>;
}): Promise<MissionControlDid.Satellite> => {
	assertNonNullish(missionControlId);

	const { create_satellite } = await getMissionControlActor({
		missionControlId,
		identity
	});

	return create_satellite(name);
};

export const createSatelliteWithConfig = async ({
	identity,
	missionControlId,
	config: { name, subnetId, kind }
}: {
	identity: Option<Identity>;
	missionControlId: Option<Principal>;
	config: CreateSatelliteConfig;
}): Promise<MissionControlDid.Satellite> => {
	assertNonNullish(missionControlId);

	const { create_satellite_with_config } = await getMissionControlActor({
		missionControlId,
		identity
	});

	return create_satellite_with_config({
		name: toNullable(name),
		subnet_id: toNullable(subnetId),
		storage: toNullable(
			kind === 'application'
				? {
						system_memory: toNullable({
							Stable: null
						})
					}
				: undefined
		)
	});
};

export const loadSatellites = async ({
	missionControlId,
	reload = false
}: {
	missionControlId: Option<Principal>;
	reload?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	if (missionControlId === undefined) {
		return { result: 'skip' };
	}

	if (missionControlId === null) {
		satellitesUncertifiedStore.set(null);
		return { result: 'success' };
	}

	const load = async (identity: Identity): Promise<MissionControlDid.Satellite[]> => {
		const { list_satellites } = await getMissionControlActor({
			missionControlId,
			identity
		});

		const satellites = await list_satellites();

		return satellites.map(([_, satellite]) => satellite);
	};

	const { identity } = get(authStore);

	return await loadDataStore<MissionControlDid.Satellite[] | null>({
		identity,
		store: satellitesUncertifiedStore,
		errorLabel: 'satellites_loading',
		load,
		reload
	});
};
