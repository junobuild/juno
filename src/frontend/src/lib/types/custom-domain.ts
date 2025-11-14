import type { SatelliteDid } from '$declarations';
import { CustomDomainResponseGetSchema, CustomDomainResponseValidationSchema } from '$lib/schemas/custom-domain.schema';
import type * as z from 'zod';

export type CustomDomainName = string;

export type CustomDomains = [CustomDomainName, SatelliteDid.CustomDomain][];

export interface CustomDomainDnsEntry {
	type: 'TXT' | 'CNAME';
	host?: string;
	value: string;
}

export interface CustomDomainDns {
	hostname: string;
	subdomain?: string;
	entries: [CustomDomainDnsEntry, ...CustomDomainDnsEntry[]];
}

// BN

/**
 * @deprecated
 */
export type CustomDomainRegistrationState =
	| 'PendingOrder'
	| 'PendingChallengeResponse'
	| 'PendingAcmeApproval'
	| 'Available'
	| 'Failed';

/**
 * @deprecated
 */
export interface CustomDomainRegistrationStateFailed {
	Failed: string;
}

/**
 * @deprecated
 */
export interface CustomDomainRegistration {
	name: string;
	canister: string;
	state: CustomDomainRegistrationState | CustomDomainRegistrationStateFailed;
}

export type CustomDomainResponseValidation = z.infer<typeof CustomDomainResponseValidationSchema>;

export type CustomDomainResponseGet = z.infer<typeof CustomDomainResponseGetSchema>;