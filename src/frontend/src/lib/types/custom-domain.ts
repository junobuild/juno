import type { SatelliteDid } from '$declarations';

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

export interface CustomDomainRegistration {
	v0: {
		State: CustomDomainRegistrationV0State;
		Response: CustomDomainRegistrationV0Response;
	};
}
