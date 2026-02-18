import type { SatelliteDid } from '$declarations';
import { setAutomationConfig as setAutomationConfigApi } from '$lib/api/satellites.api';
import { loadSatelliteConfig } from '$lib/services/satellite/satellite-config.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Satellite } from '$lib/types/satellite';
import { isEmptyString, isNullish, toNullable } from '@dfinity/utils';
import { get } from 'svelte/store';

export const buildRepositoryKey = ({
	repoUrl
}: {
	repoUrl: string;
}): { result: 'success'; repoKey: SatelliteDid.RepositoryKey } | { result: 'error' } => {
	const parsedUrl = URL.parse(repoUrl);

	if (isNullish(parsedUrl)) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.build_repo_key_invalid_url
		});

		return { result: 'error' };
	}

	const { origin, pathname } = parsedUrl;

	if (origin !== 'https://github.com') {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.build_repo_key_invalid_github_url
		});

		return { result: 'error' };
	}

	const [_, owner, repo] = pathname.split('/');

	if (isEmptyString(owner)) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.build_repo_key_owner_not_found
		});

		return { result: 'error' };
	}

	if (isEmptyString(repo)) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.build_repo_key_repo_not_found
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

export const createAutomationConfig = async ({
	identity,
	satellite,
	...rest
}: {
	satellite: Satellite;
	identity: OptionIdentity;
	repoKey: SatelliteDid.RepositoryKey;
}): Promise<{
	result: 'success' | 'error';
	err?: unknown;
}> => {
	const labels = get(i18n);

	if (isNullish(identity) || isNullish(identity?.getPrincipal())) {
		toasts.error({ text: labels.core.not_logged_in });
		return { result: 'error' };
	}

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
	repoKey
}: {
	satellite: Satellite;
	identity: OptionIdentity;
	repoKey: SatelliteDid.RepositoryKey;
}): Promise<{
	result: 'success' | 'error';
	err?: unknown;
}> => {
	try {
		const config: SatelliteDid.SetAutomationConfig = {
			openid: toNullable({
				providers: toNullable([
					{ GitHub: null },
					{
						repositories: toNullable([repoKey, { refs: toNullable() }]),
						controller: toNullable()
					}
				]),
				observatory_id: toNullable()
			}),
			version: toNullable()
		};

		await setAutomationConfigApi({
			satelliteId: satellite.satellite_id,
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
