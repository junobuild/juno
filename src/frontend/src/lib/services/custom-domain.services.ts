import type { SatelliteDid } from '$declarations';
import {
	deleteCustomDomain as deleteCustomDomainApi,
	listCustomDomains as listCustomDomainsApi,
	setCustomDomain as setCustomDomainApi
} from '$lib/api/satellites.api';
import { deleteDomain, registerDomain } from '$lib/rest/bn.v1.rest';
import { authStore } from '$lib/stores/auth.store';
import { customDomainsStore } from '$lib/stores/custom-domains.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { CustomDomainName } from '$lib/types/custom-domain';
import type { OptionIdentity } from '$lib/types/itentity';
import { assertNonNullish, fromNullable, nonNullish } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

/**
 * @see https://internetcomputer.org/docs/current/developer-docs/production/custom-domain/
 */
export const registerCustomDomain = async ({
	satelliteId,
	domainName,
	identity
}: {
	satelliteId: Principal;
	domainName: CustomDomainName;
	identity: Identity;
}) => {
	// Add domain name to list of custom domain in `./well-known/ic-domains`
	await setCustomDomainApi({
		satelliteId,
		domainName,
		boundaryNodesId: undefined,
		identity
	});

	// Register domain name with BN
	await registerDomain({ domainName });

	// In case of an error, we keep the custom domain in `./well-known/ic-domains` - this should not harm.
	// In the past, we used to update the domain to save the BN_ID, but this information
	// is no longer required with API v1. The domain name itself has become the key.
};

export const deleteCustomDomain = async ({
	satelliteId,
	customDomain,
	domainName,
	deleteCustomDomain,
	identity
}: {
	satelliteId: Principal;
	customDomain: SatelliteDid.CustomDomain;
	domainName: CustomDomainName;
	deleteCustomDomain: boolean;
	identity: OptionIdentity;
}) => {
	assertNonNullish(identity, get(i18n).core.not_logged_in);

	if (deleteCustomDomain && nonNullish(fromNullable(customDomain.bn_id))) {
		// Delete domain name in BN
		await deleteDomain({ domainName });
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
		const { identity } = get(authStore);

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
