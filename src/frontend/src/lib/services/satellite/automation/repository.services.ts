import type { SatelliteDid } from '$declarations';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { isEmptyString, isNullish } from '@dfinity/utils';
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
