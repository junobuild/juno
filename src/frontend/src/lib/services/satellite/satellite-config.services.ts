import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

import { getConfig } from '$lib/api/satellites.api';
import { uncertifiedSatellitesConfigsStore } from '$lib/stores/satellite/satellites-configs.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { SatelliteId } from '$lib/types/satellite';

export const loadSatelliteConfig = async ({
	satelliteId,
	identity,
	reload = false
}: {
	satelliteId: SatelliteId;
	identity: OptionIdentity;
	reload?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	// We load only once per session or when required.
	const existingConfigs = get(uncertifiedSatellitesConfigsStore);
	const existingConfig = existingConfigs?.[satelliteId.toText()];

	if (nonNullish(existingConfig) && !reload) {
		return { result: 'skip' };
	}

	try {
		const config = await getConfig({
			identity,
			satelliteId
		});

		uncertifiedSatellitesConfigsStore.set({
			canisterId: satelliteId.toText(),
			data: {
				data: config,
				certified: false
			}
		});

		return { result: 'success' };
	} catch (err: unknown) {
		uncertifiedSatellitesConfigsStore.reset(satelliteId.toText());

		const labels = get(i18n);

		toasts.error({
			text: labels.errors.satellite_config_loading,
			detail: err
		});

		return { result: 'error' };
	}
};
