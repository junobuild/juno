import {
	AUTH_MAX_TIME_TO_LIVE,
	AUTH_POPUP_HEIGHT,
	AUTH_POPUP_WIDTH,
	localIdentityCanisterId
} from '$lib/constants/constants';
import { createAuthClient } from '$lib/utils/auth.utils';
import { popupCenter } from '$lib/utils/window.utils';
import type { Identity } from '@dfinity/agent';
import type { AuthClient } from '@dfinity/auth-client';
import { nonNullish } from '@dfinity/utils';
import { derived, writable, type Readable } from 'svelte/store';

export interface AuthStoreData {
	identity: Identity | undefined | null;
}

let authClient: AuthClient | undefined | null;

export interface AuthSignInParams {
	domain?: 'internetcomputer.org' | 'ic0.app';
}

export interface AuthStore extends Readable<AuthStoreData> {
	sync: () => Promise<void>;
	signIn: (params: AuthSignInParams) => Promise<void>;
	signOut: () => Promise<void>;
}

const initAuthStore = (): AuthStore => {
	const { subscribe, set, update } = writable<AuthStoreData>({
		identity: undefined
	});

	return {
		subscribe,

		sync: async () => {
			authClient = authClient ?? (await createAuthClient());
			const isAuthenticated: boolean = await authClient.isAuthenticated();

			set({
				identity: isAuthenticated ? authClient.getIdentity() : null
			});
		},

		signIn: ({ domain }: AuthSignInParams) =>
			// eslint-disable-next-line no-async-promise-executor
			new Promise<void>(async (resolve, reject) => {
				authClient = authClient ?? (await createAuthClient());

				const identityProvider = nonNullish(localIdentityCanisterId)
					? `http://${localIdentityCanisterId}.localhost:8000`
					: `https://identity.${domain ?? 'internetcomputer.org'}`;

				await authClient?.login({
					maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
					onSuccess: () => {
						update((state: AuthStoreData) => ({
							...state,
							identity: authClient?.getIdentity()
						}));

						resolve();
					},
					onError: reject,
					identityProvider,
					windowOpenerFeatures: popupCenter({ width: AUTH_POPUP_WIDTH, height: AUTH_POPUP_HEIGHT })
				});
			}),

		signOut: async () => {
			const client: AuthClient = authClient ?? (await createAuthClient());

			await client.logout();

			// This fix a "sign in -> sign out -> sign in again" flow without window reload.
			authClient = null;

			update((state: AuthStoreData) => ({
				...state,
				identity: null
			}));
		}
	};
};

export const authStore = initAuthStore();

export const authSignedInStore: Readable<boolean> = derived(
	authStore,
	({ identity }) => identity !== null && identity !== undefined
);

export const authRemainingTimeStore = writable<number | undefined>(undefined);
