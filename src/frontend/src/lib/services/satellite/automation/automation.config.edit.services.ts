import type { SatelliteDid } from '$declarations';
import { setAutomationConfig } from '$lib/api/satellites.api';
import { AUTOMATION_DEFAULT_MAX_SESSION_TIME_TO_LIVE } from '$lib/constants/automation.constants';
import { loadSatelliteConfig } from '$lib/services/satellite/satellite-config.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { AddAccessKeyScope } from '$lib/types/access-keys';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Satellite } from '$lib/types/satellite';
import { isNullish, toNullable } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import { get } from 'svelte/store';

interface UpdateResult {
	result: 'skip' | 'success' | 'error';
	err?: unknown;
}

export const updateAutomationKeysConfig = async ({
	currentConfig,
	maxTimeToLive,
	scope,
	identity,
	satellite
}: {
	scope: Omit<AddAccessKeyScope, 'admin'> | undefined;
	maxTimeToLive: bigint | undefined;
	currentConfig: SatelliteDid.OpenIdAutomationProviderConfig;
	satellite: Satellite;
	identity: OptionIdentity;
}): Promise<{
	result: 'success' | 'error';
	err?: unknown;
}> => {
	const labels = get(i18n);

	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: labels.core.not_logged_in });
		return { result: 'error' };
	}

	const updateConfigOptions: SatelliteDid.OpenIdAutomationProviderConfig = {
		...currentConfig,
		controller:
			scope === 'write' && maxTimeToLive === AUTOMATION_DEFAULT_MAX_SESSION_TIME_TO_LIVE
				? []
				: toNullable({
						max_time_to_live:
							maxTimeToLive === AUTOMATION_DEFAULT_MAX_SESSION_TIME_TO_LIVE
								? []
								: toNullable(maxTimeToLive),
						scope: scope === 'write' ? [] : toNullable({ Submit: null })
					})
	};

	const updateAutomationConfig: SatelliteDid.SetAutomationConfig = {
		openid: toNullable({
			observatory_id: [],
			providers: [[{ GitHub: null }, updateConfigOptions]]
		}),
		version
	};

	const result = await updateConfig({ identity, satellite, config: updateAutomationConfig });

	if (result.result === 'success') {
		await loadSatelliteConfig({
			identity,
			satelliteId: satellite.satellite_id,
			reload: true
		});
	}

	return result;
};

const updateConfig = async ({
	satellite: { satellite_id: satelliteId },
	config,
	identity
}: {
	satellite: Satellite;
	config: SatelliteDid.SetAutomationConfig;
	identity: Identity;
}): Promise<UpdateResult> => {
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
