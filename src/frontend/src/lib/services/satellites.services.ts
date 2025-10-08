import { getMissionControlActor } from '$lib/api/actors/actor.juno.api';
import { loadDataStore } from '$lib/services/loader.services';
import { authStore } from '$lib/stores/auth.store';
import { satellitesUncertifiedStore } from '$lib/stores/satellite.store';
import type { MissionControlDid } from '$lib/types/declarations';
import type { Option } from '$lib/types/utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, toNullable } from '@dfinity/utils';
import { get } from 'svelte/store';

interface CreateSatelliteConfig {
	name: string;
	subnetId?: Principal;
	kind: 'website' | 'application';
}

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
	config: CreateSatelliteConfig;
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
	if (isNullish(missionControlId)) {
		return { result: 'skip' };
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

	return await loadDataStore<MissionControlDid.Satellite[]>({
		identity,
		store: satellitesUncertifiedStore,
		errorLabel: 'satellites_loading',
		load,
		reload
	});
};
