import type { SatelliteDid } from '$declarations';
import type { RepositoryKey } from '$declarations/satellite/satellite.did';
import {
	type UpdateAutomationConfigResult,
	updateConfig
} from '$lib/services/satellite/automation/_automation.config.services';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Satellite } from '$lib/types/satellite';
import { toDocRepositoryKey } from '$lib/utils/workflow.utils';

export const deleteAutomationRepoConfig = async ({
	automationConfig,
	providerConfig,
	repoKey,
	identity,
	satellite
}: {
	repoKey: RepositoryKey;
	automationConfig: SatelliteDid.AutomationConfig;
	providerConfig: SatelliteDid.OpenIdAutomationProviderConfig;
	satellite: Satellite;
	identity: OptionIdentity;
}): Promise<UpdateAutomationConfigResult> => {
	const keyToRemove = toDocRepositoryKey(repoKey);

	const updateProviderConfig: SatelliteDid.OpenIdAutomationProviderConfig = {
		...providerConfig,
		repositories: [
			...providerConfig.repositories.filter(([key]) => toDocRepositoryKey(key) !== keyToRemove)
		]
	};

	return await updateConfig({
		identity,
		satellite,
		automationConfig,
		providerConfig: updateProviderConfig
	});
};
