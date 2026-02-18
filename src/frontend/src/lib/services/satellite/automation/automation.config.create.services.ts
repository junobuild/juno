import type { SatelliteDid } from '$declarations';
import { setConfig } from '$lib/services/satellite/automation/_automation.config.services';
import { loadSatelliteConfig } from '$lib/services/satellite/satellite-config.services';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Satellite } from '$lib/types/satellite';
import type { WorkflowReferences } from '$lib/types/workflow';
import { toNullable } from '@dfinity/utils';

export const createAutomationConfig = async ({
	identity,
	satellite,
	...rest
}: {
	satellite: Satellite;
	identity: OptionIdentity;
	repoKey: SatelliteDid.RepositoryKey;
	repoReferences: WorkflowReferences | undefined;
}): Promise<{
	result: 'success' | 'error';
	err?: unknown;
}> => {
	const result = await setAutomationConfig({ identity, satellite, ...rest });

	if (result.result === 'success') {
		// We do not await on purpose. It isn't relevant for the UI/UX of the wizard which ends with the actions snippets.
		// It will be relevant once the user close the wizard.
		loadSatelliteConfig({
			identity,
			satelliteId: satellite.satellite_id,
			reload: true
		});
	}

	return result;
};

const setAutomationConfig = async ({
	satellite,
	identity,
	repoKey,
	repoReferences
}: {
	satellite: Satellite;
	identity: OptionIdentity;
	repoKey: SatelliteDid.RepositoryKey;
	repoReferences: WorkflowReferences | undefined;
}): Promise<{
	result: 'success' | 'error';
	err?: unknown;
}> => {
	const config: SatelliteDid.SetAutomationConfig = {
		openid: toNullable({
			providers: toNullable([
				{ GitHub: null },
				{
					repositories: toNullable([repoKey, { refs: toNullable(repoReferences) }]),
					controller: toNullable()
				}
			]),
			observatory_id: toNullable()
		}),
		version: toNullable()
	};

	return await setConfig({
		config,
		identity,
		satellite
	});
};
