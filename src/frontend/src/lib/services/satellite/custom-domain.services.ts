import type { SatelliteDid } from '$declarations';
import {
	deleteCustomDomain as deleteCustomDomainApi,
	listCustomDomains as listCustomDomainsApi
} from '$lib/api/satellites.api';
import { deleteDomainV0 } from '$lib/rest/bn.v0.rest';
import { deleteDomain } from '$lib/rest/bn.v1.rest';
import { authStore } from '$lib/stores/auth.store';
import { customDomainsStore } from '$lib/stores/custom-domains.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { CustomDomainName } from '$lib/types/custom-domain';
import type { OptionIdentity } from '$lib/types/itentity';
import { assertNonNullish, fromNullable, nonNullish } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

export const deleteCustomDomain = async ({
	satelliteId,
	customDomain,
	domainName,
	deleteCustomDomain,
	identity
}: {
	satelliteId: Principal;
	customDomain: SatelliteDid.CustomDomain;
	domainName: CustomDomainName;
	deleteCustomDomain: boolean;
	identity: OptionIdentity;
}) => {
	assertNonNullish(identity, get(i18n).core.not_logged_in);

	if (deleteCustomDomain) {
		// Delete domain name in BN
		const unregisterCustomDomain = async () => {
			const bnId = fromNullable(customDomain.bn_id);
			if (nonNullish(bnId)) {
				await deleteDomainV0({
					bnId
				});
				return;
			}

			await deleteDomain({ domainName });
		};

		await unregisterCustomDomain();
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
