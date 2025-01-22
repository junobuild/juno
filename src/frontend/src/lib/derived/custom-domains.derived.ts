import { satelliteStore } from '$lib/derived/satellites.derived';
import { customDomainsStore } from '$lib/stores/custom-domains.store';
import type { CustomDomainName, CustomDomains } from '$lib/types/custom-domain';
import { isNullish, nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const satelliteCustomDomains: Readable<CustomDomains> = derived(
	[customDomainsStore, satelliteStore],
	([$customDomainsStore, $satelliteStore]) =>
		isNullish($satelliteStore)
			? []
			: ($customDomainsStore[$satelliteStore.satellite_id.toText()] ?? [])
);

export const satelliteCustomDomainsLoaded: Readable<boolean> = derived(
	[customDomainsStore, satelliteStore],
	([$customDomainsStore, $satelliteStore]) =>
		nonNullish($satelliteStore) &&
		nonNullish($customDomainsStore[$satelliteStore.satellite_id.toText()])
);

// For simplicity reason we just return the first
export const satelliteCustomDomain: Readable<CustomDomainName | undefined> = derived(
	[satelliteCustomDomains],
	([$satelliteCustomDomains]) => $satelliteCustomDomains?.[0]?.[0]
);
