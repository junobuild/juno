import type { MissionControlDid } from '$declarations';
import { getMissionControlActor } from '$lib/api/actors/actor.juno.api';
import { loadDataStore } from '$lib/services/_loader.services';
import { authStore } from '$lib/stores/auth.store';
import { ufosUncertifiedStore } from '$lib/stores/mission-control/ufos.store';
import type { Nullish } from '@dfinity/zod-schemas';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

export const loadUfos = async ({
	missionControlId,
	reload = false
}: {
	missionControlId: Nullish<Principal>;
	reload?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	if (missionControlId === undefined) {
		return { result: 'skip' };
	}

	if (missionControlId === null) {
		ufosUncertifiedStore.set(null);
		return { result: 'success' };
	}

	const load = async (identity: Identity): Promise<MissionControlDid.Ufo[]> => {
		const { list_ufos } = await getMissionControlActor({
			missionControlId,
			identity
		});

		const ufos = await list_ufos();

		return ufos.map(([_, ufo]) => ufo);
	};

	const { identity } = get(authStore);

	return await loadDataStore<MissionControlDid.Ufo[] | null>({
		identity,
		store: ufosUncertifiedStore,
		errorLabel: 'ufos_loading',
		load,
		reload
	});
};
