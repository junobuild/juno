import type { CustomDomain } from '$declarations/satellite/satellite.did';

export type CustomDomainName = string;

export type CustomDomains = [CustomDomainName, CustomDomain][];

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

export type CustomDomainRegistrationState =
	| 'PendingOrder'
	| 'PendingChallengeResponse'
	| 'PendingAcmeApproval'
	| 'Available'
	| 'Failed';

export interface CustomDomainRegistrationStateFailed {
	Failed: string;
}

export interface CustomDomainRegistration {
	name: string;
	canister: string;
	state: CustomDomainRegistrationState | CustomDomainRegistrationStateFailed;
}
