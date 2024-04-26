import type { Satellite } from '$declarations/mission_control/mission_control.did';
import type { AuthenticationConfig, CustomDomain } from '$declarations/satellite/satellite.did';
import {
	deleteCustomDomain as deleteCustomDomainApi,
	getAuthConfig as getAuthConfigApi,
	listCustomDomains as listCustomDomainsApi,
	satelliteVersion,
	setCustomDomain as setCustomDomainApi
} from '$lib/api/satellites.api';
import { deleteDomain, registerDomain } from '$lib/rest/bn.rest';
import { authStore } from '$lib/stores/auth.store';
import { busy } from '$lib/stores/busy.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { CustomDomains } from '$lib/types/custom-domain';
import type { OptionIdentity } from '$lib/types/itentity';
import type { JunoModalCustomDomainDetail } from '$lib/types/modal';
import { emit } from '$lib/utils/events.utils';
import type { Principal } from '@dfinity/principal';
import { fromNullable, nonNullish } from '@dfinity/utils';
import { compare } from 'semver';
import { get } from 'svelte/store';

/**
 * https://internetcomputer.org/docs/current/developer-docs/production/custom-domain/
 */
export const setCustomDomain = async ({
	satelliteId,
	domainName
}: {
	satelliteId: Principal;
	domainName: string;
}) => {
	const identity = get(authStore).identity;

	// Add domain name to list of custom domain in `./well-known/ic-domains`
	await setCustomDomainApi({
		satelliteId,
		domainName,
		boundaryNodesId: undefined,
		identity
	});

	// Register domain name with BN
	const boundaryNodesId = await registerDomain({ domainName });

	// Save above request ID provided in previous step
	await setCustomDomainApi({
		satelliteId,
		domainName,
		boundaryNodesId,
		identity
	});
};

export const deleteCustomDomain = async ({
	satelliteId,
	customDomain,
	domainName,
	deleteCustomDomain
}: {
	satelliteId: Principal;
	customDomain: CustomDomain;
	domainName: string;
	deleteCustomDomain: boolean;
}) => {
	const identity = get(authStore).identity;

	if (deleteCustomDomain && nonNullish(fromNullable(customDomain.bn_id))) {
		// Delete domain name in BN
		await deleteDomain(customDomain);
	}

	// Remove custom domain from satellite
	await deleteCustomDomainApi({
		satelliteId,
		domainName,
		identity
	});
};

export const listCustomDomains = async ({
	satelliteId
}: {
	satelliteId: Principal;
}): Promise<{ success: boolean; customDomains?: CustomDomains }> => {
	try {
		const identity = get(authStore).identity;

		const customDomains = await listCustomDomainsApi({
			satelliteId,
			identity
		});

		return { success: true, customDomains };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.hosting_loading_errors,
			detail: err
		});

		return { success: false };
	}
};

export const openAddCustomDomain = async ({
	satellite,
	identity,
	editDomainName
}: {
	satellite: Satellite;
	identity: OptionIdentity;
} & Pick<JunoModalCustomDomainDetail, 'editDomainName'>) => {
	try {
		busy.start();

		// TODO: load versions globally and use store value instead of fetching version again
		const version = await satelliteVersion({ satelliteId: satellite.satellite_id, identity });

		// TODO: keep a list of those version checks and remove them incrementally
		// Also would be cleaner than to have 0.0.17 hardcoded there and there...
		const authConfigSupported = compare(version, '0.0.17') >= 0;

		if (!authConfigSupported) {
			emit({
				message: 'junoModal',
				detail: {
					type: 'add_custom_domain',
					detail: { satellite, editDomainName, satelliteVersion: version }
				}
			});
			return { success: true };
		}

		const { success, config } = await getAuthConfig({
			satelliteId: satellite.satellite_id,
			identity
		});

		if (!success) {
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type: 'add_custom_domain',
				detail: { satellite, config, editDomainName, satelliteVersion: version }
			}
		});
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.authentication_config_loading,
			detail: err
		});

		return { success: false };
	} finally {
		busy.stop();
	}
};

const getAuthConfig = async ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: OptionIdentity;
}): Promise<{ success: boolean; config?: AuthenticationConfig | undefined }> => {
	const config = await getAuthConfigApi({
		satelliteId,
		identity
	});

	return { success: true, config: fromNullable(config) };
};
