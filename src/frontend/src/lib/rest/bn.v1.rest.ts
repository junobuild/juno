import {
	DeleteCustomDomainStateSchema,
	GetCustomDomainStateSchema,
	GetCustomDomainValidateSchema,
	PostCustomDomainStateSchema
} from '$lib/schemas/custom-domain.schema';
import type { CustomDomainName, CustomDomainRegistration } from '$lib/types/custom-domain';
import { assertNonNullish, isEmptyString } from '@dfinity/utils';

const BN_CUSTOM_DOMAINS_URL = import.meta.env.VITE_BN_CUSTOM_DOMAINS_URL;

interface CustomDomainRegistrationParams {
	domainName: CustomDomainName;
}

export const getCustomDomainRegistration = async ({
	domainName
}: CustomDomainRegistrationParams): Promise<
	CustomDomainRegistration['v1']['State'] | undefined
> => {
	if (isEmptyString(BN_CUSTOM_DOMAINS_URL)) {
		return undefined;
	}

	const response = await fetch(`${BN_CUSTOM_DOMAINS_URL}/${domainName}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Error getting status for ${domainName} on the Boundary Nodes: ${text}`);
	}

	const data = await response.json();

	return GetCustomDomainStateSchema.parse(data);
};

export const registerDomain = async ({
	domainName
}: CustomDomainRegistrationParams): Promise<void> => {
	assertNonNullish(
		BN_CUSTOM_DOMAINS_URL,
		'Boundary Node API URL not defined. This service is unavailable.'
	);

	const response = await fetch(`${BN_CUSTOM_DOMAINS_URL}/${domainName}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Error registering ${domainName} on the Boundary Nodes: ${text}`);
	}

	const data = await response.json();

	const result = PostCustomDomainStateSchema.parse(data);

	if (result.status === 'success') {
		return;
	}

	throw new Error(`Failed to register ${domainName} on the Boundary Nodes: ${result.errors}`);
};

export const deleteDomain = async ({
	domainName
}: CustomDomainRegistrationParams): Promise<void> => {
	assertNonNullish(
		BN_CUSTOM_DOMAINS_URL,
		'Boundary Node API URL not defined. This service is unavailable.'
	);

	const response = await fetch(`${BN_CUSTOM_DOMAINS_URL}/${domainName}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Error deleting ${domainName} on the Boundary Nodes: ${text}`);
	}

	const data = await response.json();

	const result = DeleteCustomDomainStateSchema.parse(data);

	if (result.status === 'success') {
		return;
	}

	throw new Error(`Failed to delete ${domainName} on the Boundary Nodes: ${result.errors}`);
};

export const validateDomain = async ({
	domainName
}: CustomDomainRegistrationParams): Promise<void> => {
	assertNonNullish(
		BN_CUSTOM_DOMAINS_URL,
		'Boundary Node API URL not defined. This service is unavailable.'
	);

	const response = await fetch(`${BN_CUSTOM_DOMAINS_URL}/${domainName}/validate`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Error validating ${domainName} on the Boundary Nodes: ${text}`);
	}

	const data = await response.json();

	const result = GetCustomDomainValidateSchema.parse(data);

	if (result.status === 'success') {
		return;
	}

	throw new Error(`Failed to validate ${domainName} on the Boundary Nodes: ${result.errors}`);
};
