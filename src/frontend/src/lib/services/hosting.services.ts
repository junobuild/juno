import type { CustomDomain } from '$declarations/satellite/satellite.did';
import {
	listCustomDomains as listCustomDomainsApi,
	setCustomDomain
} from '$lib/api/satellites.api';
import type { CustomDomainRegistration } from '$lib/types/custom-domain';
import { fromNullable } from '$lib/utils/did.utils';
import { isNullish } from '$lib/utils/utils';
import type { Principal } from '@dfinity/principal';

/**
 * https://github.com/r-birkner/portal/blob/rjb/update-custom-domains-docs/docs/developer-docs/deploy/custom-domain.md
 */
export const addCustomDomain = async ({
	satelliteId,
	domainName
}: {
	satelliteId: Principal;
	domainName: string;
}) => {
	// Add domain name to list of custom domain in `./well-known/ic-domains`
	await setCustomDomain({
		satelliteId,
		domainName,
		boundaryNodesId: undefined
	});

	// Register domain name with BN
	const boundaryNodesId = await registerDomain({ domainName });

	// Save above request ID provided in previous step
	await setCustomDomain({
		satelliteId,
		domainName,
		boundaryNodesId
	});
};

export const listCustomDomains = async ({
	satelliteId
}: {
	satelliteId: Principal;
}): Promise<[string, CustomDomain][]> => {
	const customDomains: [string, CustomDomain][] = await listCustomDomainsApi({
		satelliteId
	});

	// TODO: GET ic0.app/registrations/REQUEST_ID

	return customDomains;
};

const BN_REGISTRATIONS_URL = import.meta.env.VITE_BN_REGISTRATIONS_URL;

const registerDomain = async ({ domainName }: { domainName: string }): Promise<string> => {
	const response = await fetch(BN_REGISTRATIONS_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ name: domainName })
	});

	if (!response.ok) {
		throw new Error(`Registering ${domainName} with the boundary nodes failed.`);
	}

	const result: { id: string } = await response.json();

	console.log('BN POST result', result);

	return result.id;
};

export const getCustomDomainRegistration = async ({
	bn_id
}: CustomDomain): Promise<CustomDomainRegistration | undefined> => {
	const id = fromNullable(bn_id);

	if (isNullish(id) || id === '') {
		return undefined;
	}

	const response = await fetch(`${BN_REGISTRATIONS_URL}/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`Fetching custom domain state from the boundary nodes failed.`);
	}

	const result: CustomDomainRegistration = await response.json();

	console.log('BN GET result', result);

	return result;
};
