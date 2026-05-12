import {
	deleteCustomDomain as deleteCustomDomainApi,
	listCustomDomains as listCustomDomainsApi
} from '$lib/api/satellites.api';
import { deleteDomain } from '$lib/rest/bn.v1.rest';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { authStore } from '$lib/stores/auth.store';
import { customDomainsStore } from '$lib/stores/satellite/custom-domains.store';
import type { CustomDomainName } from '$lib/types/custom-domain';
import type { NullishIdentity } from '$lib/types/itentity';
import { assertNonNullish, nonNullish } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

export const deleteCustomDomain = async ({
	satelliteId,
	domainName,
	deleteCustomDomain,
	identity
}: {
	satelliteId: Principal;
	domainName: CustomDomainName;
	deleteCustomDomain: boolean;
	identity: NullishIdentity;
}) => {
	assertNonNullish(identity, get(i18n).core.not_logged_in);

	if (deleteCustomDomain) {
		await deleteDomain({ domainName });
	}

	// Remove custom domain from satellite
	await deleteCustomDomainApi({
		satelliteId,
		domainName,
		identity
	});
};

export const listCustomDomains = async ({
	satelliteId,
	reload
}: {
	satelliteId: Principal;
	reload: boolean;
}): Promise<{ success: boolean }> => {
	try {
		const { identity } = get(authStore);

		const store = get(customDomainsStore);
		if (nonNullish(store[satelliteId.toText()]) && !reload) {
			return { success: true };
		}

		const customDomains = await listCustomDomainsApi({
			satelliteId,
			identity
		});

		customDomainsStore.setCustomDomains({ satelliteId: satelliteId.toText(), customDomains });

		return { success: true };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.hosting_loading_errors,
			detail: err
		});

		return { success: false };
	}
};
