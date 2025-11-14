import type { SatelliteDid } from '$declarations';
import type { CustomDomainRegistration } from '$lib/types/custom-domain';
import { assertNonNullish, fromNullable, isNullish } from '@dfinity/utils';

const BN_REGISTRATIONS_URL = import.meta.env.VITE_BN_REGISTRATIONS_URL;

/**
 * @deprecated
 */
export const getCustomDomainRegistrationV0 = async ({
	bn_id
}: SatelliteDid.CustomDomain): Promise<CustomDomainRegistration['v0']['State'] | undefined> => {
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

	const result: CustomDomainRegistration['v0']['State'] = await response.json();

	return result;
};

/**
 * @deprecated
 */
export const deleteDomainV0 = async ({ bnId }: { bnId: string }): Promise<void> => {
	assertNonNullish(
		BN_REGISTRATIONS_URL,
		'Boundary Node API URL not defined. This service is unavailable.'
	);

	const response = await fetch(`${BN_REGISTRATIONS_URL}/${bnId}`, {
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
