import type { CustomDomain } from '$declarations/satellite/satellite.did';
import {
	listCustomDomains as listCustomDomainsApi,
	setCustomDomain
} from '$lib/api/satellites.api';
import type { Principal } from '@dfinity/principal';

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

	// TODO: POST call BN ic0.app/registrations
	const boundaryNodesId = '123';

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
