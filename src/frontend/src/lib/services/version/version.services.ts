import type { Orbiter, Satellite } from '$declarations/mission_control/mission_control.did';
import { reloadMissionControlVersion } from '$lib/services/version/version.mission-control.services';
import { reloadOrbiterVersion } from '$lib/services/version/version.orbiter.services';
import { reloadSatelliteVersion } from '$lib/services/version/version.satellite.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { MissionControlId } from '$lib/types/mission-control';
import type { Option } from '$lib/types/utils';
import { nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const loadVersions = async ({
	identity,
	missionControlId,
	satellites,
	orbiter
}: {
	missionControlId: MissionControlId;
	orbiter: Option<Orbiter>;
	satellites: Satellite[];
	identity: OptionIdentity;
}): Promise<{ result: 'loaded' | 'error' }> => {
	const commonParams = {
		identity,
		skipReload: true,
		toastError: false
	};

	const results = await Promise.all([
		reloadMissionControlVersion({
			missionControlId,
			...commonParams
		}),
		...(nonNullish(orbiter)
			? [
					reloadOrbiterVersion({
						orbiter,
						...commonParams
					})
				]
			: [Promise.resolve({ result: 'skipped' as const })]),
		...satellites.map((satellite) =>
			reloadSatelliteVersion({
				satelliteId: satellite.satellite_id,
				...commonParams
			})
		)
	]);

	const hasError = results.find((result) => result.result === 'error');

	if (!hasError) {
		return { result: 'loaded' };
	}

	toasts.error({
		text: get(i18n).errors.load_version
	});

	return { result: 'error' };
};
