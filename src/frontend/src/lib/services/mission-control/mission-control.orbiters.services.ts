import type { MissionControlDid } from '$declarations';
import { getMissionControlActor } from '$lib/api/actors/actor.juno.api';
import { loadDataStore } from '$lib/services/_loader.services';
import { authStore } from '$lib/stores/auth.store';
import { orbitersUncertifiedStore } from '$lib/stores/mission-control/orbiter.store';
import type { Option } from '$lib/types/utils';
import { assertNonNullish, isNullish, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

interface CreateOrbiterConfig {
	name?: string;
	subnetId?: Principal;
}

export const createOrbiter = async ({
	identity,
	missionControlId,
	config: { name }
}: {
	identity: Option<Identity>;
	missionControlId: Option<Principal>;
	config: CreateOrbiterConfig;
}): Promise<MissionControlDid.Orbiter> => {
	assertNonNullish(missionControlId);

	const { create_orbiter } = await getMissionControlActor({
		missionControlId,
		identity
	});

	return create_orbiter(toNullable(name));
};

export const createOrbiterWithConfig = async ({
	identity,
	missionControlId,
	config: { name, subnetId }
}: {
	identity: Option<Identity>;
	missionControlId: Option<Principal>;
	config: CreateOrbiterConfig;
}): Promise<MissionControlDid.Orbiter> => {
	assertNonNullish(missionControlId);

	const { create_orbiter_with_config } = await getMissionControlActor({
		missionControlId,
		identity
	});

	return create_orbiter_with_config({
		name: toNullable(name),
		subnet_id: toNullable(subnetId)
	});
};

export const loadOrbiters = async ({
	missionControlId,
	reload = false
}: {
	missionControlId: Option<Principal>;
	reload?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	if (isNullish(missionControlId)) {
		return { result: 'skip' };
	}

	const load = async (identity: Identity): Promise<MissionControlDid.Orbiter[]> => {
		const { list_orbiters } = await getMissionControlActor({
			missionControlId,
			identity
		});

		const orbiters = await list_orbiters();

		return orbiters.map(([_, orbiter]) => orbiter);
	};

	const { identity } = get(authStore);

	return await loadDataStore<MissionControlDid.Orbiter[]>({
		identity,
		store: orbitersUncertifiedStore,
		errorLabel: 'orbiters_loading',
		load,
		reload
	});
};
