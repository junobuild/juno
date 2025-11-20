import { CONSOLE_CANISTER_ID, GOOGLE_CLIENT_ID } from '$lib/constants/app.constants';
import { AuthClientProvider } from '$lib/providers/auth-client.provider';
import { clearAuthNavOrigin, saveAuthNavOrigin } from '$lib/services/auth/_auth.nav.services';
import { authStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import { SignInInitError } from '$lib/types/errors';
import { container } from '$lib/utils/juno.utils';
import { isNullish } from '@dfinity/utils';
import { authenticate, requestJwt } from '@junobuild/auth';
import { get } from 'svelte/store';

export const signInWithGoogle = async () => {
	try {
		saveAuthNavOrigin();

		await signInWithGoogleFn();
	} catch (err: unknown) {
		clearAuthNavOrigin();

		toasts.error({
			text: get(i18n).errors.sign_in,
			detail: err
		});
	}
};

const signInWithGoogleFn = async () => {
	if (isNullish(GOOGLE_CLIENT_ID)) {
		throw new SignInInitError(
			'Google sign-in cannot be initialized because GOOGLE_CLIENT_ID is not configured.'
		);
	}

	const {
		location: { origin }
	} = window;

	await requestJwt({
		google: {
			redirect: {
				clientId: GOOGLE_CLIENT_ID,
				redirectUrl: `${origin}/auth/callback/google`
			}
		}
	});
};

const authenticateWithOpenID = async () => {
	const {
		identity: { delegationChain, sessionKey }
	} = await authenticate({
		redirect: null,
		auth: {
			console: {
				consoleId: CONSOLE_CANISTER_ID,
				...container()
			}
		}
	});

	await AuthClientProvider.getInstance().setAuthClientStorage({
		delegationChain,
		sessionKey
	});
};

export const handleRedirectCallback = async (): Promise<{
	result: 'ok' | 'error';
	err?: unknown;
}> => {
	try {
		await authStore.signInWithOpenId({ signInFn: authenticateWithOpenID });

		return { result: 'ok' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.stack_trace,
			detail: err
		});

		return { result: 'error', err };
	}
};
