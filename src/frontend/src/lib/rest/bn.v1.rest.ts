import {
	GetCustomDomainStateSchema,
	PostCustomDomainStateSchema
} from '$lib/schemas/custom-domain.schema';
import type { CustomDomainName, CustomDomainRegistration } from '$lib/types/custom-domain';
import { assertNonNullish, isEmptyString } from '@dfinity/utils';

const BN_CUSTOM_DOMAINS_URL = import.meta.env.VITE_BN_CUSTOM_DOMAINS_URL;

export const getCustomDomainRegistration = async ({
	domain
}: {
	domain: CustomDomainName;
}): Promise<CustomDomainRegistration['v1']['State'] | undefined> => {
	if (isEmptyString(BN_CUSTOM_DOMAINS_URL)) {
		return undefined;
	}

	const response = await fetch(`${BN_CUSTOM_DOMAINS_URL}/${domain}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Fetching custom domain state from the boundary nodes failed. ${text}`);
	}

	const data = await response.json();

	return GetCustomDomainStateSchema.parse(data);
};

export const registerDomain = async ({ domainName }: { domainName: string }): Promise<void> => {
	assertNonNullish(
		BN_CUSTOM_DOMAINS_URL,
		'Boundary Node API URL not defined. This service is unavailable.'
	);

	const response = await fetch(`${BN_CUSTOM_DOMAINS_URL}/${domainName}`, {
		method: 'POST'
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Registering ${domainName} with the boundary nodes failed. ${text}`);
	}

	const data = await response.json();

	const result = PostCustomDomainStateSchema.parse(data);

	if (result.status === 'success') {
		return;
	}

	throw new Error(`Registering ${domainName} with the boundary nodes failed. ${result.errors}`);
};
