import type { AuthenticationConfig, CustomDomain } from '$declarations/satellite/satellite.did';
import {
	deleteCustomDomain as deleteCustomDomainApi,
	getAuthConfig as getAuthConfigApi,
	listCustomDomains as listCustomDomainsApi,
	satelliteVersion,
	setCustomDomain as setCustomDomainApi
} from '$lib/api/satellites.api';
import { SATELLITE_v0_0_17 } from '$lib/constants/version.constants';
import { deleteDomain, registerDomain } from '$lib/rest/bn.rest';
import { authStore } from '$lib/stores/auth.store';
import { customDomainsStore } from '$lib/stores/custom-domains.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Principal } from '@dfinity/principal';
import { fromNullable, nonNullish } from '@dfinity/utils';
import { compare } from 'semver';
import { get } from 'svelte/store';

/**
 * https://internetcomputer.org/docs/current/developer-docs/production/custom-domain/
 */
export const setCustomDomain = async ({
	satelliteId,
	domainName
}: {
	satelliteId: Principal;
	domainName: string;
}) => {
	const identity = get(authStore).identity;

	// Add domain name to list of custom domain in `./well-known/ic-domains`
	await setCustomDomainApi({
		satelliteId,
		domainName,
		boundaryNodesId: undefined,
		identity
	});

	// Register domain name with BN
	const boundaryNodesId = await registerDomain({ domainName });

	// Save above request ID provided in previous step
	await setCustomDomainApi({
		satelliteId,
		domainName,
		boundaryNodesId,
		identity
	});
};

export const deleteCustomDomain = async ({
	satelliteId,
	customDomain,
	domainName,
	deleteCustomDomain
}: {
	satelliteId: Principal;
	customDomain: CustomDomain;
	domainName: string;
	deleteCustomDomain: boolean;
}) => {
	const identity = get(authStore).identity;

	if (deleteCustomDomain && nonNullish(fromNullable(customDomain.bn_id))) {
		// Delete domain name in BN
		await deleteDomain(customDomain);
	}

	// Remove custom domain from satellite
	await deleteCustomDomainApi({
		satelliteId,
		domainName,
		identity
	});
};

export const listCustomDomains = async ({
	satelliteId,
	reload
}: {
	satelliteId: Principal;
	reload: boolean;
}): Promise<{ success: boolean }> => {
	try {
		const identity = get(authStore).identity;

		const store = get(customDomainsStore);
		if (nonNullish(store[satelliteId.toText()]) && !reload) {
			return { success: true };
		}

		const customDomains = await listCustomDomainsApi({
			satelliteId,
			identity
		});

		customDomainsStore.setCustomDomains({ satelliteId: satelliteId.toText(), customDomains });

		return { success: true };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.hosting_loading_errors,
			detail: err
		});

		return { success: false };
	}
};

export const getAuthConfig = async ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<{
	result: 'success' | 'error' | 'skip';
	config?: AuthenticationConfig | undefined;
}> => {
	try {
		// TODO: load versions globally and use store value instead of fetching version again
		const version = await satelliteVersion({ satelliteId, identity });

		// TODO: keep a list of those version checks and remove them incrementally
		// Also would be cleaner than to have 0.0.17 hardcoded there and there...
		const authConfigSupported = compare(version, SATELLITE_v0_0_17) >= 0;

		if (!authConfigSupported) {
			return { result: 'skip' };
		}

		const config = await getAuthConfigApi({
			satelliteId,
			identity
		});

		return { result: 'success', config: fromNullable(config) };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.authentication_config_loading,
			detail: err
		});

		return { result: 'error' };
	}
};
