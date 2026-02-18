import type { SatelliteDid } from '$declarations';
import { setAutomationConfig } from '$lib/api/satellites.api';
import { loadSatelliteConfig } from '$lib/services/satellite/satellite-config.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Satellite } from '$lib/types/satellite';
import { isNullish, toNullable } from '@dfinity/utils';
import { get } from 'svelte/store';

export interface UpdateAutomationConfigResult {
	success: 'ok' | 'error';
	err?: unknown;
}

interface UpdateResult {
	result: 'success' | 'error';
	err?: unknown;
}

export const updateConfig = async ({
	satellite,
	automationConfig,
	providerConfig,
	identity
}: {
	satellite: Satellite;
	automationConfig: SatelliteDid.AutomationConfig;
	providerConfig: SatelliteDid.OpenIdAutomationProviderConfig;
	identity: OptionIdentity;
}): Promise<UpdateAutomationConfigResult> => {
	const updateAutomationConfig: SatelliteDid.SetAutomationConfig = {
		...automationConfig,
		openid: toNullable({
			observatory_id: [],
			providers: [[{ GitHub: null }, providerConfig]]
		})
	};

	const result = await setConfig({
		identity,
		satellite,
		config: updateAutomationConfig
	});

	if (result.result === 'error') {
		return {
			success: 'error',
			err: result.err
		};
	}

	if (result.result === 'success') {
		// Reload Satellite configuration
		await loadSatelliteConfig({
			identity,
			satelliteId: satellite.satellite_id,
			reload: true
		});
	}

	return { success: 'ok' };
};

export const setConfig = async ({
	satellite: { satellite_id: satelliteId },
	config,
	identity
}: {
	satellite: Satellite;
	config: SatelliteDid.SetAutomationConfig;
	identity: OptionIdentity;
}): Promise<UpdateResult> => {
	const labels = get(i18n);

	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: labels.core.not_logged_in });
		return { result: 'error' };
	}

	try {
		await setAutomationConfig({
			satelliteId,
			config,
			identity
		});
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.save_automation_config,
			detail: err
		});

		return { result: 'error', err };
	}

	return { result: 'success' };
};
