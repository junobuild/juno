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

export type CustomDomainState = z.infer<typeof CustomDomainStateSchema>;

export type GetCustomDomainState = z.infer<typeof GetCustomDomainStateSchema>;

export interface CustomDomainRegistration {
	v1: {
		State: GetCustomDomainState;
	};
}
