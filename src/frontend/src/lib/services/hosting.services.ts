import type { AuthenticationConfig } from '$declarations/satellite/satellite.did';
import { setAuthConfig } from '$lib/api/satellites.api';
import { setCustomDomain } from '$lib/services/custom-domain.services';
import { execute } from '$lib/services/progress.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { type HostingProgress, HostingProgressStep } from '$lib/types/progress-hosting';
import type { Option } from '$lib/types/utils';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, nonNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const configHosting = async ({
	satelliteId,
	editConfig,
	domainName,
	identity,
	onProgress
}: {
	domainName: string;
	editConfig: Option<AuthenticationConfig>;
	satelliteId: Principal;
	identity: OptionIdentity;
	onProgress: (progress: HostingProgress | undefined) => void;
}): Promise<{ success: 'ok' | 'error'; err?: unknown }> => {
	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		const configCustomDomain = async () =>
			await setCustomDomain({
				satelliteId,
				domainName
			});

		await execute({ fn: configCustomDomain, onProgress, step: HostingProgressStep.CustomDomain });

		if (nonNullish(editConfig)) {
			const configAuth = async () =>
				await setAuthConfig({
					satelliteId,
					config: editConfig,
					identity
				});

			await execute({ fn: configAuth, onProgress, step: HostingProgressStep.AuthConfig });
		}
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.hosting_configuration_issues,
			detail: err
		});

		return { success: 'error', err };
	}

	return { success: 'ok' };
};
