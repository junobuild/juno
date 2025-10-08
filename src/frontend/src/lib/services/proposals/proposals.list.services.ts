import type { MissionControlDid } from '$declarations';
import { SATELLITE_v0_1_0 } from '$lib/constants/version.constants';
import { isSatelliteFeatureSupported } from '$lib/services/feature.services';
import { reloadSatelliteProposals } from '$lib/services/proposals/proposals.list.satellite.services';
import { i18n } from '$lib/stores/i18n.store';
import { proposalsStore } from '$lib/stores/proposals.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { get } from 'svelte/store';

export const loadProposals = async ({
	identity,
	satellites
}: {
	satellites: MissionControlDid.Satellite[];
	identity: OptionIdentity;
}): Promise<{ result: 'loaded' | 'error' }> => {
	// Split those Satellites that do not support proposals.
	const [newSatellites, oldSatellites] = satellites.reduce<
		[MissionControlDid.Satellite[], MissionControlDid.Satellite[]]
	>(
		([newSat, oldSat], satellite) => {
			// The component assert that all versions are loaded. That's why we can get the version imperatively here.
			const newestAPI = isSatelliteFeatureSupported({
				satelliteId: satellite.satellite_id,
				requiredMinVersion: SATELLITE_v0_1_0
			});

			return newestAPI ? [[...newSat, satellite], oldSat] : [newSat, [...oldSat, satellite]];
		},
		[[], []]
	);

	// For simplicity reason, we just display no changes for old satellites.
	oldSatellites.forEach((oldSatellite) =>
		proposalsStore.setSatellite({
			satelliteId: oldSatellite.satellite_id.toText(),
			proposals: []
		})
	);

	const commonParams = {
		identity,
		skipReload: true,
		toastError: false
	};

	const results = await Promise.all([
		...newSatellites.map((satellite) =>
			reloadSatelliteProposals({
				satelliteId: satellite.satellite_id,
				...commonParams
			})
		)
	]);

	const hasError = results.find((result) => result.result === 'error');

	if (!hasError) {
		return { result: 'loaded' };
	}

	toasts.warn(get(i18n).errors.load_proposals);

	return { result: 'error' };
};
