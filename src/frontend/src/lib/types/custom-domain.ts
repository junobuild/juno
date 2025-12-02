import type { SatelliteDid } from '$declarations';
import type {
	CustomDomainStateSchema,
	GetCustomDomainStateSchema
} from '$lib/schemas/custom-domain.schema';
import type * as z from 'zod';

export type CustomDomainName = string;

export type CustomDomain = [CustomDomainName, SatelliteDid.CustomDomain];

export type CustomDomains = CustomDomain[];

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

export type CustomDomainState = z.infer<typeof CustomDomainStateSchema>;

/**
 * @deprecated
 */
type CustomDomainRegistrationV0State =
	| 'PendingOrder'
	| 'PendingChallengeResponse'
	| 'PendingAcmeApproval'
	| 'Available'
	| 'Failed';

/**
 * @deprecated
 */
interface CustomDomainRegistrationV0StateFailed {
	Failed: string;
}

/**
 * @deprecated
 */
interface CustomDomainRegistrationV0Response {
	name: string;
	canister: string;
	state: CustomDomainRegistrationV0State | CustomDomainRegistrationV0StateFailed;
}

export type GetCustomDomainState = z.infer<typeof GetCustomDomainStateSchema>;

export interface CustomDomainRegistration {
	/**
	 * @deprecated
	 */
	v0: {
		State: CustomDomainRegistrationV0Response;
	};
	v1: {
		State: GetCustomDomainState;
	};
}
