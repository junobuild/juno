import type { MissionControlDid } from '$declarations';
import { getMissionControlActor } from '$lib/api/actors/actor.juno.api';
import { MISSION_CONTROL_v0_1_3 } from '$lib/constants/version.constants';
import { loadDataStore } from '$lib/services/_loader.services';
import { getMissionControlVersionMetadata } from '$lib/services/version/version.metadata.mission-control.services';
import { authStore } from '$lib/stores/auth.store';
import { ufosUncertifiedStore } from '$lib/stores/mission-control/ufos.store';
import { versionStore } from '$lib/stores/version.store';
import { isEmptyString, notEmptyString } from '@dfinity/utils';
import type { Nullish } from '@dfinity/zod-schemas';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { compare } from 'semver';
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

	const instantMissionControlVersion = (): string | undefined =>
		get(versionStore)?.missionControl?.current;

	const currentVersion = instantMissionControlVersion();

	if (notEmptyString(currentVersion) && compare(currentVersion, MISSION_CONTROL_v0_1_3) < 0) {
		ufosUncertifiedStore.set([]);
		return { result: 'success' };
	}

	const load = async (identity: Identity): Promise<MissionControlDid.Ufo[]> => {
		// TODO: Version might not been loading yet. We could refactor to avoid imperatively
		// loading an additional time the version
		if (isEmptyString(currentVersion)) {
			const instantVersion = await getMissionControlVersionMetadata({
				identity,
				missionControlId
			});

			if (compare(instantVersion?.metadata?.current ?? '0.0.0', MISSION_CONTROL_v0_1_3) < 0) {
				return [];
			}
		}

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
