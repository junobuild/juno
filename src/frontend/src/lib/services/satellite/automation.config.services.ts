import type { SatelliteDid } from '$declarations';
import { getAutomationConfig as getAutomationConfigApi } from '$lib/api/satellites.api';
import { SATELLITE_v0_1_4 } from '$lib/constants/version.constants';
import { isSatelliteFeatureSupported } from '$lib/services/_feature.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { SatelliteId } from '$lib/types/satellite';
import { fromNullable, isEmptyString, isNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const getAutomationConfig = async ({
	satelliteId,
	identity
}: {
	satelliteId: SatelliteId;
	identity: OptionIdentity;
}): Promise<{
	result: 'success' | 'error' | 'skip';
	config?: SatelliteDid.AutomationConfig | undefined;
}> => {
	try {
		const automationConfigSupported = isSatelliteFeatureSupported({
			satelliteId,
			// TODO: v0.2.0
			requiredMinVersion: SATELLITE_v0_1_4
		});

		if (!automationConfigSupported) {
			return { result: 'skip' };
		}

		const config = await getAutomationConfigApi({
			satelliteId,
			identity
		});

		return { result: 'success', config: fromNullable(config) };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.automation_config_loading,
			detail: err
		});

		return { result: 'error' };
	}
};

export const buildRepositoryKey = ({
	repoUrl
}: {
	repoUrl: string;
}): { result: 'success'; repoKey: SatelliteDid.RepositoryKey } | { result: 'error' } => {
	const parsedUrl = URL.parse(repoUrl);

	if (isNullish(parsedUrl)) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.build_automation_config_invalid_url
		});

		return { result: 'error' };
	}

	const { origin, pathname } = parsedUrl;

	if (origin !== 'https://github.com') {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.build_automation_config_invalid_github_url
		});

		return { result: 'error' };
	}

	const [_, owner, repo] = pathname.split('/');

	if (isEmptyString(owner)) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.build_automation_config_owner_not_found
		});

		return { result: 'error' };
	}

	if (isEmptyString(repo)) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.build_automation_config_repo_not_found
		});

		return { result: 'error' };
	}

	const repoKey: SatelliteDid.RepositoryKey = {
		owner,
		name: repo
	};

	return {
		result: 'success',
		repoKey
	};
};
