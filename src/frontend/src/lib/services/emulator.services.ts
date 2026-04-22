import { isNotSkylab } from '$lib/env/app.env';
import {
	emulatorObservatoryMonitoringOpenId,
	getEmulatorMainIdentity
} from '$lib/rest/emulator.rest';
import { addSatellitesAdminAccessKey } from '$lib/services/access-keys/satellites.key.add.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import type { AddAdminAccessKeyParams } from '$lib/types/access-keys';
import type { OpenIdAuthProvider } from '$lib/types/auth';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { get } from 'svelte/store';

/**
 * In the Skylab emulator environment, where developers use a version of the Console UI deployed within the container,
 * we need a way to grant the inner CLI (running inside the Docker container) access to the Satellites.
 * Without this, we can't offer live reload capabilities — which, in my opinion, is really important during development.
 *
 * To prevent any abuse, these functions are guarded by the SKYLAB flag, and the URL is blocked by the CSP in production.
 */
export const unsafeSetEmulatorControllerForSatellite = async ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: Identity;
}) => {
	const add = (params: AddAdminAccessKeyParams): Promise<void> =>
		addSatellitesAdminAccessKey({
			...params,
			identity,
			satelliteIds: [satelliteId]
		});

	await unsafeSetEmulatorController({
		addController: add
	});
};

const unsafeSetEmulatorController = async ({
	addController
}: {
	addController: (params: AddAdminAccessKeyParams) => Promise<void>;
}) => {
	if (isNotSkylab()) {
		throw new Error(get(i18n).emulator.error_never_execute_set_controller);
	}

	const mainIdentity = await getEmulatorMainIdentity();

	await addController({
		accessKeyId: mainIdentity,
		metadata: {
			kind: 'emulator'
		}
	});
};

export const emulatorToggleOpenIdMonitoring = async ({
	enable,
	provider
}: {
	enable: boolean;
	provider: OpenIdAuthProvider;
}) => {
	if (isNotSkylab()) {
		throw new Error(get(i18n).emulator.error_never_execute_openid_monitoring);
	}

	try {
		await emulatorObservatoryMonitoringOpenId({
			action: enable ? 'start' : 'stop',
			provider
		});
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).emulator.error_toggling_openid_monitoring_failed,
			detail: err
		});
	}
};
