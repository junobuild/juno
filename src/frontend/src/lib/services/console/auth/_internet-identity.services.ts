import {
	AUTH_MAX_TIME_TO_LIVE,
	AUTH_POPUP_HEIGHT,
	AUTH_POPUP_WIDTH,
	INTERNET_IDENTITY_CANISTER_ID,
	LOCAL_REPLICA_HOST
} from '$lib/constants/app.constants';
import { isDev } from '$lib/env/app.env';
import type { SignInWithNewAuthClient } from '$lib/types/auth';
import { SignInError, SignInUserInterruptError } from '$lib/types/errors';
import { clearIdentityStorage } from '$lib/utils/identity-storage';
import { popupCenter } from '$lib/utils/window.utils';
import { AuthClient, ERROR_USER_INTERRUPT, IdbStorage } from '@icp-sdk/auth/client';

/**
 * Create a fresh AuthClient for an Internet Identity sign-in.
 *
 * Clears any previously stored session key / delegation chain before
 * creating the client so AuthClient.create() starts on clean IDB.
 * Otherwise a tampered or out-of-sync stored key would pair with the
 * freshly issued delegation and produce an ECDSA P256 signature /
 * delegation mismatch on the next call.
 *
 * agent-js prints noisy console.warn during AuthClient.create(); we
 * silence it locally for the duration of the call.
 */
const createAuthClient = async (): Promise<AuthClient> => {
	await clearIdentityStorage();

	const originalWarn = globalThis.console.warn;
	globalThis.console.warn = (): null => null;

	try {
		return await AuthClient.create({
			storage: new IdbStorage(),
			idleOptions: {
				disableIdle: true,
				disableDefaultIdleCallback: true
			}
		});
	} finally {
		globalThis.console.warn = originalWarn;
	}
};

const identityProviderUrl = (): string =>
	isDev()
		? /apple/i.test(navigator?.vendor)
			? `${LOCAL_REPLICA_HOST}?canisterId=${INTERNET_IDENTITY_CANISTER_ID}`
			: `http://${INTERNET_IDENTITY_CANISTER_ID}.${new URL(LOCAL_REPLICA_HOST).host}`
		: 'https://id.ai';

export const signInWithII: SignInWithNewAuthClient = async () => {
	const authClient = await createAuthClient();

	return new Promise<void>((resolve, reject) => {
		authClient.login({
			maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
			allowPinAuthentication: false,
			onSuccess: () => resolve(),
			onError: (error?: string) => {
				if (error === ERROR_USER_INTERRUPT) {
					reject(new SignInUserInterruptError(error));
					return;
				}
				reject(new SignInError(error));
			},
			identityProvider: identityProviderUrl(),
			windowOpenerFeatures: popupCenter({ width: AUTH_POPUP_WIDTH, height: AUTH_POPUP_HEIGHT })
		});
	});
};
