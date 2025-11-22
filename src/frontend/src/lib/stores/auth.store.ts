import { AuthBroadcastChannel } from '$lib/providers/auth-broadcast.provider';
import { AuthClientProvider } from '$lib/providers/auth-client.provider';
import type { SignInWithAuthClient, SignInWithNewAuthClient } from '$lib/types/auth';
import { SignInInitError } from '$lib/types/errors';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Option } from '$lib/types/utils';
import { isNullish, nonNullish } from '@dfinity/utils';
import type { AuthClient } from '@icp-sdk/auth/client';
import { type Readable, writable } from 'svelte/store';

export interface AuthStoreData {
	identity: OptionIdentity;
}

let authClient: Option<AuthClient>;

export interface AuthStore extends Readable<AuthStoreData> {
	sync: () => Promise<void>;
	forceSync: () => Promise<void>;
	signInWithII: (params: { signInFn: SignInWithAuthClient }) => Promise<void>;
	signInWithOpenId: (params: { signInFn: SignInWithNewAuthClient }) => Promise<void>;
	signOut: () => Promise<void>;
}

const initAuthStore = (): AuthStore => {
	const { subscribe, set } = writable<AuthStoreData>({
		identity: undefined
	});

	// With different tabs opened of Juno in the same browser, it may happen that separate authClient objects are out-of-sync among themselves.
	// To avoid issues, we use this method to pick the most up-to-date authClient object, since the data are cached in IndexedDB.
	const pickAuthClient = async (): Promise<AuthClient> => {
		if (nonNullish(authClient) && (await authClient.isAuthenticated())) {
			return authClient;
		}

		const { createAuthClient, safeCreateAuthClient } = AuthClientProvider.getInstance();

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
		authClient = forceSync
			? await AuthClientProvider.getInstance().createAuthClient()
			: await pickAuthClient();

		const isAuthenticated = await authClient.isAuthenticated();

		set({ identity: isAuthenticated ? authClient.getIdentity() : null });
	};

	const broadCastSignIn = () => {
		try {
			// If the user has more than one tab open in the same browser,
			// there could be a mismatch of the cached delegation chain vs the identity key of the `authClient` object.
			// This causes the `authClient` to be unable to correctly sign calls, raising Trust Errors.
			// To mitigate this, we use a BroadcastChannel to notify other tabs when a login has occurred, so that they can sync their `authClient` object.
			const bc = AuthBroadcastChannel.getInstance();
			bc.postLoginSuccess();
		} catch (err: unknown) {
			// We don't really care if the broadcast channel fails to open or if it fails to post messages.
			// This is a non-critical feature that improves the UX when Juno is open in multiple tabs.
			// We just print a warning in the console for debugging purposes.
			console.warn('Auth BroadcastChannel posting failed', err);
		}
	};

	return {
		subscribe,

		sync: async () => {
			await sync({ forceSync: false });
		},

		forceSync: async () => {
			await sync({ forceSync: true });
		},

		signInWithII: async ({ signInFn }) => {
			if (isNullish(authClient)) {
				throw new SignInInitError();
			}

			const { identity } = await signInFn({ authClient });
			set({ identity });

			broadCastSignIn();
		},

		signInWithOpenId: async ({ signInFn }) => {
			await signInFn();

			await sync({ forceSync: true });

			broadCastSignIn();
		},

		signOut: async () => {
			const { createAuthClient } = AuthClientProvider.getInstance();

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
