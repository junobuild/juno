import {
	AUTH_MAX_TIME_TO_LIVE,
	AUTH_POPUP_HEIGHT,
	AUTH_POPUP_WIDTH,
	INTERNET_IDENTITY_CANISTER_ID,
	LOCAL_REPLICA_HOST
} from '$lib/constants/app.constants';
import { isDev } from '$lib/env/app.env';
import { SignInError, SignInInitError, SignInUserInterruptError } from '$lib/types/errors';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Option } from '$lib/types/utils';
import { createAuthClient, resetAuthClient } from '$lib/utils/auth.utils';
import { popupCenter } from '$lib/utils/window.utils';
import { type AuthClient, ERROR_USER_INTERRUPT } from '@dfinity/auth-client';
import { isNullish } from '@dfinity/utils';
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
	const { subscribe, set } = writable<AuthStoreData>({
		identity: undefined
	});

	return {
		subscribe,

		sync: async () => {
			authClient = authClient ?? (await createAuthClient());
			const isAuthenticated = await authClient.isAuthenticated();

			if (!isAuthenticated) {
				authClient = await resetAuthClient();
				set({ identity: null });
				return;
			}

			set({
				identity: isAuthenticated ? authClient.getIdentity() : null
			});
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
