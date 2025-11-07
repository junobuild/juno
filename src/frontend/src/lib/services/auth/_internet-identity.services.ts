import {
	AUTH_MAX_TIME_TO_LIVE,
	AUTH_POPUP_HEIGHT,
	AUTH_POPUP_WIDTH,
	INTERNET_IDENTITY_CANISTER_ID,
	LOCAL_REPLICA_HOST
} from '$lib/constants/app.constants';
import { isDev } from '$lib/env/app.env';
import type { SignedInIdentity, SignInWithAuthClient } from '$lib/types/auth';
import { SignInError, SignInUserInterruptError } from '$lib/types/errors';
import { popupCenter } from '$lib/utils/window.utils';
import { ERROR_USER_INTERRUPT } from '@icp-sdk/auth/client';

export const signInWithII: SignInWithAuthClient = ({ authClient }) =>
	// eslint-disable-next-line no-async-promise-executor
	new Promise<SignedInIdentity>(async (resolve, reject) => {
		const identityProvider = isDev()
			? /apple/i.test(navigator?.vendor)
				? `${LOCAL_REPLICA_HOST}?canisterId=${INTERNET_IDENTITY_CANISTER_ID}`
				: `http://${INTERNET_IDENTITY_CANISTER_ID}.${new URL(LOCAL_REPLICA_HOST).host}`
			: `https://identity.internetcomputer.org`;

		await authClient?.login({
			maxTimeToLive: AUTH_MAX_TIME_TO_LIVE,
			allowPinAuthentication: false,
			onSuccess: () => {
				resolve({ identity: authClient?.getIdentity() });
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
	});
