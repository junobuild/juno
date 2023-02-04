import { AUTH_MAX_TIME_TO_LIVE, localIdentityCanisterId } from '$lib/constants/constants';
import { createAuthClient } from '$lib/utils/auth.utils';
import type { Identity } from '@dfinity/agent';
import type { AuthClient } from '@dfinity/auth-client';
import { derived, writable, type Readable } from 'svelte/store';

export interface AuthStoreData {
	identity: Identity | undefined | null;
	invitationCode: string | undefined | null;
}

let authClient: AuthClient | undefined | null;

export interface AuthStore extends Readable<AuthStoreData> {
	sync: () => Promise<void>;
	signIn: (invitationCode: string | undefined) => Promise<void>;
	signOut: () => Promise<void>;
}

const initAuthStore = (): AuthStore => {
	const { subscribe, set, update } = writable<AuthStoreData>({
		identity: undefined,
		invitationCode: undefined
	});

	return {
		subscribe,

		sync: async () => {
			authClient = authClient ?? (await createAuthClient());
			const isAuthenticated: boolean = await authClient.isAuthenticated();

			set({
				identity: isAuthenticated ? authClient.getIdentity() : null,
				invitationCode: undefined
			});
		},

		signIn: (invitationCode: string | undefined) =>
			// eslint-disable-next-line no-async-promise-executor
			new Promise<void>(async (resolve, reject) => {
				authClient = authClient ?? (await createAuthClient());

				await authClient?.login({
					maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
					onSuccess: () => {
						update((state: AuthStoreData) => ({
							...state,
							identity: authClient?.getIdentity(),
							invitationCode
						}));

						resolve();
					},
					onError: reject,
					...(localIdentityCanisterId !== null &&
						localIdentityCanisterId !== undefined && {
							identityProvider: `http://${localIdentityCanisterId}.localhost:8000?#authorize`
						})
				});
			}),

		signOut: async () => {
			const client: AuthClient = authClient ?? (await createAuthClient());

			await client.logout();

			// This fix a "sign in -> sign out -> sign in again" flow without window reload.
			authClient = null;

			update((state: AuthStoreData) => ({
				...state,
				identity: null,
				invitationCode: null
			}));
		}
	};
};

export const authStore = initAuthStore();

export const authSignedInStore: Readable<boolean> = derived(
	authStore,
	({ identity }) => identity !== null && identity !== undefined
);
