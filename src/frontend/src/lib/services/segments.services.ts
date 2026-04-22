import { loadConsoleSegments } from '$lib/services/console/segments.services';
import { loadOrbiters } from '$lib/services/mission-control/mission-control.orbiters.services';
import { loadSatellites } from '$lib/services/mission-control/mission-control.satellites.services';
import { loadUfos } from '$lib/services/mission-control/mission-control.ufos.services';
import type { Nullish } from '@dfinity/zod-schemas';
import type { Principal } from '@icp-sdk/core/principal';

export const loadSegments = async ({
	missionControlId,
	reload = false,
	reloadSatellites = true,
	reloadOrbiters = true,
	reloadUfos = true
}: {
	missionControlId: Nullish<Principal>;
	reload?: boolean;
	reloadSatellites?: boolean;
	reloadOrbiters?: boolean;
	reloadUfos?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	if (missionControlId === undefined) {
		return { result: 'skip' };
	}

	const promises = [
		loadConsoleSegments({ reload }),
		...(reloadSatellites ? [loadSatellites({ missionControlId, reload })] : []),
		...(reloadOrbiters ? [loadOrbiters({ missionControlId, reload })] : []),
		...(reloadUfos ? [loadUfos({ missionControlId, reload })] : [])
	];

	const results = await Promise.allSettled(promises);

	const hasError = results.find(({ status }) => status === 'rejected');

	return { result: hasError ? 'error' : 'success' };
};
