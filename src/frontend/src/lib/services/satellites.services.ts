import type { Satellite } from '$declarations/mission_control/mission_control.did';
import { getMissionControlActor } from '$lib/api/actors/actor.juno.api';
import { loadDataStore } from '$lib/services/loader.services';
import { authStore } from '$lib/stores/auth.store';
import { satellitesDataStore } from '$lib/stores/satellite.store';
import type { Option } from '$lib/types/utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, toNullable } from '@dfinity/utils';
import { get } from 'svelte/store';

interface CreateSatelliteConfig {
	name: string;
	subnetId?: Principal;
}

export const createSatellite = async ({
	missionControl,
	config: { name }
}: {
	missionControl: Option<Principal>;
	config: CreateSatelliteConfig;
}): Promise<Satellite | undefined> => {
	assertNonNullish(missionControl);

	const identity = get(authStore).identity;

	const { create_satellite } = await getMissionControlActor({
		missionControlId: missionControl,
		identity
	});
	return create_satellite(name);
};

export const createSatelliteWithConfig = async ({
	missionControl,
	config: { name, subnetId }
}: {
	missionControl: Option<Principal>;
	config: CreateSatelliteConfig;
}): Promise<Satellite | undefined> => {
	assertNonNullish(missionControl);

	const identity = get(authStore).identity;

	const { create_satellite_with_config } = await getMissionControlActor({
		missionControlId: missionControl,
		identity
	});
	return create_satellite_with_config({
		name: toNullable(name),
		subnet_id: toNullable(subnetId)
	});
};

export const loadSatellites = async ({
	missionControl,
	reload = false
}: {
	missionControl: Option<Principal>;
	reload?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	if (isNullish(missionControl)) {
		return { result: 'skip' };
	}

	const load = async (identity: Identity): Promise<Satellite[]> => {
		const { list_satellites } = await getMissionControlActor({
			missionControlId: missionControl,
			identity
		});

		const satellites = await list_satellites();

		return satellites.map(([_, satellite]) => satellite);
	};

	const identity = get(authStore).identity;

	return await loadDataStore<Satellite[]>({
		identity,
		store: satellitesDataStore,
		errorLabel: 'satellites_loading',
		load,
		reload
	});
};
