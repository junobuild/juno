import {
	AUTH_MAX_TIME_TO_LIVE,
	AUTH_POPUP_HEIGHT,
	AUTH_POPUP_WIDTH,
	DEV,
	INTERNET_IDENTITY_CANISTER_ID
} from '$lib/constants/app.constants';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Option } from '$lib/types/utils';
import { createAuthClient } from '$lib/utils/auth.utils';
import { popupCenter } from '$lib/utils/window.utils';
import type { AuthClient } from '@dfinity/auth-client';
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

				const identityProvider = DEV
					? /apple/i.test(navigator?.vendor)
						? `http://localhost:5987?canisterId=${INTERNET_IDENTITY_CANISTER_ID}`
						: `http://${INTERNET_IDENTITY_CANISTER_ID}.localhost:5987`
					: `https://identity.${domain ?? 'internetcomputer.org'}`;

				await authClient?.login({
					maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
					allowPinAuthentication: false,
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

export const authRemainingTimeStore = writable<number | undefined>(undefined);
