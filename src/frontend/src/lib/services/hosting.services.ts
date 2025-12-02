import type { SatelliteDid } from '$declarations';
import { setAuthConfig, setCustomDomain as setCustomDomainApi } from '$lib/api/satellites.api';
import { registerDomain, validateDomain } from '$lib/rest/bn.v1.rest';
import { execute } from '$lib/services/progress.services';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import { type HostingProgress, HostingProgressStep } from '$lib/types/progress-hosting';
import { buildSetAuthenticationConfig } from '$lib/utils/auth.config.utils';
import { waitForMilliseconds } from '$lib/utils/timeout.utils';
import { assertNonNullish, fromNullishNullable, notEmptyString } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';
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
	config: SatelliteDid.AuthenticationConfig | undefined;
	satelliteId: Principal;
	identity: OptionIdentity;
	onProgress: (progress: HostingProgress | undefined) => void;
}): Promise<{ success: 'ok' | 'error'; err?: unknown }> => {
	try {
		assertNonNullish(identity, get(i18n).core.not_logged_in);

		// Set up the Satellite

		const setupCustomDomain = async () =>
			await setCustomDomainApi({
				satelliteId,
				domainName,
				boundaryNodesId: undefined,
				identity
			});

		await execute({ fn: setupCustomDomain, onProgress, step: HostingProgressStep.Setup });

		// Validation
		const validateCustomDomain = async () => {
			// When testing custom domain registration, one attempt failed on the first try with the following error:
			// Error validating www.something.com on the Boundary Nodes: {"status":"error","message":"Failed to validate DNS records or verify canister ownership","data":{"domain":"www.something.com"},"errors":"unprocessable_entity: domain is missing from canister ...-cai list of known domains"}
			//
			// This was unexpected. To reduce the likelihood of it happening again, we wait a few seconds before validating the domain.
			//
			// This is a naive approach since the issue should be rare. If it becomes more frequent, we should implement a proper solution
			// using `waitReady` and passing a function that fetches `canister-id.icp0.io/.well-known/ic-domains`, checking the content
			// until the registered domain appears.
			await waitForMilliseconds(2000);

			await validateDomain({
				domainName
			});
		};

		await execute({ fn: validateCustomDomain, onProgress, step: HostingProgressStep.Validate });

		// Register

		const configCustomDomain = async () => await registerDomain({ domainName });

		await execute({ fn: configCustomDomain, onProgress, step: HostingProgressStep.Register });

		// Authentication (Optional)

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
					config: {
						...editConfig,
						version: config?.version ?? []
					},
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
