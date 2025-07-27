import type { AuthenticationConfig } from '$declarations/satellite/satellite.did';
import { setAuthConfig } from '$lib/api/satellites.api';
import { setCustomDomain } from '$lib/services/custom-domain.services';
import { execute } from '$lib/services/progress.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { type HostingProgress, HostingProgressStep } from '$lib/types/progress-hosting';
import { buildSetAuthenticationConfig } from '$lib/utils/auth.config.utils';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, fromNullishNullable, notEmptyString } from '@dfinity/utils';
import { get } from 'svelte/store';

export const configHosting = async ({
	satelliteId,
	useDomainForDerivationOrigin,
	config,
	domainName,
	identity,
	onProgress
}: {
	domainName: string;
	useDomainForDerivationOrigin: boolean;
	config: AuthenticationConfig | undefined;
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

		const existingDerivationOrigin = fromNullishNullable(
			fromNullishNullable(config?.internet_identity)?.derivation_origin
		);

		const editDomainName = useDomainForDerivationOrigin ? domainName : existingDerivationOrigin;

		// We set or update the derivation origin. Update is useful to append the new domain name into the .well-known/ii-alternative-origins
		if (notEmptyString(editDomainName)) {
			const editConfig = buildSetAuthenticationConfig({
				config,
				domainName: editDomainName
			});

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
