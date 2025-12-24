import { loadConsoleSegments } from '$lib/services/console/segments.services';
import { loadOrbiters } from '$lib/services/mission-control/mission-control.orbiters.services';
import { loadSatellites } from '$lib/services/mission-control/mission-control.satellites.services';
import type { Option } from '$lib/types/utils';
import type { Principal } from '@icp-sdk/core/principal';

export const loadSegments = async ({
	missionControlId,
	reload = false,
	reloadSatellites = true,
	reloadOrbiters = true
}: {
	missionControlId: Option<Principal>;
	reload?: boolean;
	reloadSatellites?: boolean;
	reloadOrbiters?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	if (missionControlId === undefined) {
		return { result: 'skip' };
	}

	const promises = [
		loadConsoleSegments({ reload }),
		...(reloadSatellites ? [loadSatellites({ missionControlId, reload })] : []),
		...(reloadOrbiters ? [loadOrbiters({ missionControlId, reload })] : [])
	];

	const results = await Promise.allSettled(promises);

	const hasError = results.find(({ status }) => status === 'rejected');

	return { result: hasError ? 'error' : 'success' };
};
