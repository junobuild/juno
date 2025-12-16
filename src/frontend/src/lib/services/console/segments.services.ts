import type { ConsoleDid } from '$declarations';
import { getConsoleActor } from '$lib/api/actors/actor.juno.api';
import { loadDataStore } from '$lib/services/_loader.services';
import { authStore } from '$lib/stores/auth.store';
import { segmentsUncertifiedStore } from '$lib/stores/console/segments.store';
import type { Option } from '$lib/types/utils';
import { toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

export const loadSegments = async ({
	missionControlId,
	reload = false
}: {
	missionControlId: Option<Principal>;
	reload?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	if (missionControlId === undefined) {
		return { result: 'skip' };
	}

	//TODO reset if misionControl not null

	const load = async (
		identity: Identity
	): Promise<[ConsoleDid.SegmentKey, ConsoleDid.Segment][]> => {
		const { list_segments } = await getConsoleActor({
			identity
		});

		return await list_segments({
			segment_id: toNullable(),
			segment_type: toNullable()
		});
	};

	const { identity } = get(authStore);

	return await loadDataStore<[ConsoleDid.SegmentKey, ConsoleDid.Segment][]>({
		identity,
		store: segmentsUncertifiedStore,
		errorLabel: 'segments_loading',
		load,
		reload
	});
};
