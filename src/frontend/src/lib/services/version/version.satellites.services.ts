import type { Satellite } from '$declarations/mission_control/mission_control.did';
import { reloadSatelliteVersion } from '$lib/services/version/version.satellite.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { get } from 'svelte/store';

export const loadSatellitesVersions = async ({
	identity,
	satellites
}: {
	satellites: Satellite[];
	identity: OptionIdentity;
}): Promise<{ result: 'loaded' | 'error' }> => {
	const commonParams = {
		identity,
		skipReload: true,
		toastError: false
	};

	const results = await Promise.all([
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
