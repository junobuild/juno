import type { SatelliteDid } from '$declarations';
import { AUTOMATION_DEFAULT_MAX_SESSION_TIME_TO_LIVE } from '$lib/constants/automation.constants';
import {
	type UpdateAutomationConfigResult,
	updateConfig
} from '$lib/services/satellite/automation/_automation.config.services';
import type { AddAccessKeyScope } from '$lib/types/access-keys';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Satellite } from '$lib/types/satellite';
import type { WorkflowReferences } from '$lib/types/workflow';
import { toNullable } from '@dfinity/utils';

export const updateAutomationKeysConfig = async ({
	automationConfig,
	providerConfig,
	maxTimeToLive,
	scope,
	identity,
	satellite
}: {
	scope: Omit<AddAccessKeyScope, 'admin'> | undefined;
	maxTimeToLive: bigint | undefined;
	automationConfig: SatelliteDid.AutomationConfig;
	providerConfig: SatelliteDid.OpenIdAutomationProviderConfig;
	satellite: Satellite;
	identity: OptionIdentity;
}): Promise<UpdateAutomationConfigResult> => {
	const updateProviderConfig: SatelliteDid.OpenIdAutomationProviderConfig = {
		...providerConfig,
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

	return await updateConfig({
		identity,
		satellite,
		automationConfig,
		providerConfig: updateProviderConfig
	});
};

export const updateAutomationConnectRepositoryConfig = async ({
	automationConfig,
	providerConfig,
	repoKey,
	repoReferences,
	identity,
	satellite
}: {
	repoKey: SatelliteDid.RepositoryKey;
	repoReferences: WorkflowReferences | undefined;
	automationConfig: SatelliteDid.AutomationConfig;
	providerConfig: SatelliteDid.OpenIdAutomationProviderConfig;
	satellite: Satellite;
	identity: OptionIdentity;
}): Promise<UpdateAutomationConfigResult> => {
	const updateProviderConfig: SatelliteDid.OpenIdAutomationProviderConfig = {
		...providerConfig,
		repositories: [...providerConfig.repositories, [repoKey, { refs: toNullable(repoReferences) }]]
	};

	return await updateConfig({
		identity,
		satellite,
		automationConfig,
		providerConfig: updateProviderConfig
	});
};
