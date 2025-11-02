import {
	AUTH_MAX_TIME_TO_LIVE,
	AUTH_POPUP_HEIGHT,
	AUTH_POPUP_WIDTH,
	INTERNET_IDENTITY_CANISTER_ID,
	LOCAL_REPLICA_HOST
} from '$lib/constants/app.constants';
import { isDev } from '$lib/env/app.env';
import { AuthBroadcastChannel } from '$lib/services/auth/auth-broadcast.services';
import { SignInError, SignInInitError, SignInUserInterruptError } from '$lib/types/errors';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Option } from '$lib/types/utils';
import { createAuthClient, safeCreateAuthClient } from '$lib/providers/auth-client.provider';
import { popupCenter } from '$lib/utils/window.utils';
import { type AuthClient, ERROR_USER_INTERRUPT } from '@dfinity/auth-client';
import { isNullish, nonNullish } from '@dfinity/utils';
import { type Readable, writable } from 'svelte/store';

export interface AuthStoreData {
	identity: OptionIdentity;
}

let authClient: Option<AuthClient>;

export interface AuthSignInParams {
	domain?: 'internetcomputer.org' | 'ic0.app';
}

export interface AuthStore extends Readable<AuthStoreData> {
	sync: () => Promise<void>;
	forceSync: () => Promise<void>;
	signIn: (params: AuthSignInParams) => Promise<void>;
	signOut: () => Promise<void>;
}

const initAuthStore = (): AuthStore => {
	const { subscribe, set } = writable<AuthStoreData>({
		identity: undefined
	});

	// With different tabs opened of OISy in the same browser, it may happen that separate authClient objects are out-of-sync among themselves.
	// To avoid issues, we use this method to pick the most up-to-date authClient object, since the data are cached in IndexedDB.
	const pickAuthClient = async (): Promise<AuthClient> => {
		if (nonNullish(authClient) && (await authClient.isAuthenticated())) {
			return authClient;
		}

		const refreshed = await createAuthClient();

		if (await refreshed.isAuthenticated()) {
			return refreshed;
		}

		// When the user signs out, we trigger a call to `sync()`.
		// The `sync()` method creates a new `AuthClient` (since the previous one was nullified on sign-out), causing the creation of new identity keys in IndexedDB.
		// To avoid using such keys (or tampered ones) for the next login, we use the method `safeCreateAuthClient()` which clears any stored keys before creating a new `AuthClient`.
		// We do it only if the user is not authenticated, because if it is, then it is theoretically already safe (or at least, it is out of our control to make it safer).
		return await safeCreateAuthClient();
	};

	const sync = async ({ forceSync }: { forceSync: boolean }) => {
		authClient = forceSync ? await createAuthClient() : await pickAuthClient();

		const isAuthenticated = await authClient.isAuthenticated();

		set({ identity: isAuthenticated ? authClient.getIdentity() : null });
	};

	return {
		subscribe,

		sync: async () => {
			await sync({ forceSync: false });
		},

		forceSync: async () => {
			await sync({ forceSync: true });
		},

		signIn: ({ domain }: AuthSignInParams) =>
			// eslint-disable-next-line no-async-promise-executor
			new Promise<void>(async (resolve, reject) => {
				if (isNullish(authClient)) {
					reject(new SignInInitError());
					return;
				}

				const identityProvider = isDev()
					? /apple/i.test(navigator?.vendor)
						? `${LOCAL_REPLICA_HOST}?canisterId=${INTERNET_IDENTITY_CANISTER_ID}`
						: `http://${INTERNET_IDENTITY_CANISTER_ID}.${new URL(LOCAL_REPLICA_HOST).host}`
					: `https://identity.${domain ?? 'internetcomputer.org'}`;

				await authClient?.login({
					maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
					allowPinAuthentication: false,
					onSuccess: () => {
						set({ identity: authClient?.getIdentity() });

						try {
							// If the user has more than one tab open in the same browser,
							// there could be a mismatch of the cached delegation chain vs the identity key of the `authClient` object.
							// This causes the `authClient` to be unable to correctly sign calls, raising Trust Errors.
							// To mitigate this, we use a BroadcastChannel to notify other tabs when a login has occurred, so that they can sync their `authClient` object.
							const bc = new AuthBroadcastChannel();
							bc.postLoginSuccess();
						} catch (err: unknown) {
							// We don't really care if the broadcast channel fails to open or if it fails to post messages.
							// This is a non-critical feature that improves the UX when OISY is open in multiple tabs.
							// We just print a warning in the console for debugging purposes.
							console.warn('Auth BroadcastChannel posting failed', err);
						}

						resolve();
					},
					onError: (error?: string) => {
						if (error === ERROR_USER_INTERRUPT) {
							reject(new SignInUserInterruptError(error));
							return;
						}

						reject(new SignInError(error));
					},
					identityProvider,
					windowOpenerFeatures: popupCenter({ width: AUTH_POPUP_WIDTH, height: AUTH_POPUP_HEIGHT })
				});
			}),

		signOut: async () => {
			const client: AuthClient = authClient ?? (await createAuthClient());

			await client.logout();

			// Reset local object otherwise next sign in (sign in - sign out - sign in) might not work out - i.e. agent-js might not recreate the delegation or identity if not reset
			// Technically we do not need this since we recreate the agent below. We just keep it to make the reset explicit.
			authClient = null;

			set({ identity: null });

			// Recreate an HttpClient immediately because next sign-in, if window is not reloaded, would fail if the agent is created within the process.
			// For example, Safari blocks the Internet Identity (II) window if the agent is created during the interaction.
			// Agent-js must be created either globally or at least before performing a sign-in.
			authClient = await createAuthClient();
		}
	};
};

export const authStore = initAuthStore();

export const authRemainingTimeStore = writable<number | undefined>(undefined);
