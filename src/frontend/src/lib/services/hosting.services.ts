import type { CustomDomain } from '$declarations/satellite/satellite.did';
import {
	deleteCustomDomain as deleteCustomDomainApi,
	listCustomDomains as listCustomDomainsApi,
	setCustomDomain as setCustomDomainApi
} from '$lib/api/satellites.api';
import { deleteDomain, registerDomain } from '$lib/rest/bn.rest';
import { authStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { CustomDomains } from '$lib/types/custom-domain';
import type { Principal } from '@dfinity/principal';
import { fromNullable, nonNullish } from '@dfinity/utils';
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
	satelliteId
}: {
	satelliteId: Principal;
}): Promise<{ success: boolean; customDomains?: CustomDomains }> => {
	try {
		const identity = get(authStore).identity;

		const customDomains = await listCustomDomainsApi({
			satelliteId,
			identity
		});

		return { success: true, customDomains };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.hosting_loading_errors,
			detail: err
		});

		return { success: false };
	}
};
