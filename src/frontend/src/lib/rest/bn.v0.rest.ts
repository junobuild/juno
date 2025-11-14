import type { SatelliteDid } from '$declarations';
import type { CustomDomainRegistration } from '$lib/types/custom-domain';
import { assertNonNullish, fromNullable, isNullish } from '@dfinity/utils';

const BN_REGISTRATIONS_URL = import.meta.env.VITE_BN_REGISTRATIONS_URL;

/**
 * @deprecated
 */
export const getCustomDomainRegistrationV0 = async ({
																											bn_id
																										}: SatelliteDid.CustomDomain): Promise<CustomDomainRegistration['v0']['Response'] | undefined> => {
	const id = fromNullable(bn_id);

	if (isNullish(id) || id === '') {
		return undefined;
	}

	if (isNullish(BN_REGISTRATIONS_URL)) {
		return undefined;
	}

	const response = await fetch(`${BN_REGISTRATIONS_URL}/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Fetching custom domain state from the boundary nodes failed. ${text}`);
	}

	const result: CustomDomainRegistration['v0']['Response'] = await response.json();

	return result;
};

/**
 * @deprecated
 */
export const registerDomainV0 = async ({ domainName }: { domainName: string }): Promise<string> => {
	assertNonNullish(
		BN_REGISTRATIONS_URL,
		'Boundary Node API URL not defined. This service is unavailable.'
	);

	const response = await fetch(BN_REGISTRATIONS_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ name: domainName })
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Registering ${domainName} with the boundary nodes failed. ${text}`);
	}

	const result: { id: string } = await response.json();

	return result.id;
};

/**
 * @deprecated
 */
export const deleteDomainV0 = async ({ bn_id }: SatelliteDid.CustomDomain): Promise<void> => {
	assertNonNullish(
		BN_REGISTRATIONS_URL,
		'Boundary Node API URL not defined. This service is unavailable.'
	);

	const id = fromNullable(bn_id);

	if (isNullish(id) || id === '') {
		throw new Error(`No existing BN id provided to delete custom domain.`);
	}

	const response = await fetch(`${BN_REGISTRATIONS_URL}/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Deleting custom domain in the boundary nodes failed. ${text}`);
	}
};
