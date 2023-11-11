import type { CustomDomain } from '$declarations/satellite/satellite.did';
import {
	deleteCustomDomain as deleteCustomDomainApi,
	listCustomDomains as listCustomDomainsApi,
	setCustomDomain as setCustomDomainApi
} from '$lib/api/satellites.api';
import { deleteDomain, registerDomain } from '$lib/rest/bn.rest';
import { fromNullable } from '$lib/utils/did.utils';
import type { Principal } from '@dfinity/principal';
import { nonNullish } from '@dfinity/utils';

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
	// Add domain name to list of custom domain in `./well-known/ic-domains`
	await setCustomDomainApi({
		satelliteId,
		domainName,
		boundaryNodesId: undefined
	});

	// Register domain name with BN
	const boundaryNodesId = await registerDomain({ domainName });

	// Save above request ID provided in previous step
	await setCustomDomainApi({
		satelliteId,
		domainName,
		boundaryNodesId
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
	if (deleteCustomDomain && nonNullish(fromNullable(customDomain.bn_id))) {
		// Delete domain name in BN
		await deleteDomain(customDomain);
	}

	// Remove custom domain from satellite
	await deleteCustomDomainApi({
		satelliteId,
		domainName
	});
};

export const listCustomDomains = async ({
	satelliteId
}: {
	satelliteId: Principal;
}): Promise<[string, CustomDomain][]> =>
	listCustomDomainsApi({
		satelliteId
	});
