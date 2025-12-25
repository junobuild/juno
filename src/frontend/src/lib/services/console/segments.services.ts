import type { ConsoleDid } from '$declarations';
import { getConsoleActor } from '$lib/api/actors/actor.juno.api';
import { loadDataStore } from '$lib/services/_loader.services';
import { authStore } from '$lib/stores/auth.store';
import { segmentsUncertifiedStore } from '$lib/stores/console/segments.store';
import { toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { get } from 'svelte/store';

export const loadConsoleSegments = async ({
	reload = false
}: {
	reload?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	// We load the modules from the Console even if the Mission Control
	// is available because some might not have been transferred when
	// the Mission Control was created. e.g. because too many controllers were already
	// used or unexpected errors. The stores filter duplicates.

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
