import { CONSOLE_CANISTER_ID, GOOGLE_CLIENT_ID } from '$lib/constants/app.constants';
import { AuthClientProvider } from '$lib/providers/auth-client.provider';
import { authStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import { SignInInitError } from '$lib/types/errors';
import { container } from '$lib/utils/juno.utils';
import { isNullish } from '@dfinity/utils';
import { authenticate as authenticateApi, requestJwt } from '@junobuild/auth';
import { get } from 'svelte/store';

export const signInWithGoogle = async () => {
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
				redirectUrl: `${origin}/auth/callback`
			}
		}
	});
};

const authenticateWithGoogle = async () => {
	const { delegationChain, sessionKey } = await authenticateApi({
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

export const authenticate = async (): Promise<{
	result: 'ok' | 'error';
	err?: unknown;
}> => {
	try {
		await authStore.signInWithOpenId({ signInFn: authenticateWithGoogle });

		return { result: 'ok' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.stack_trace,
			detail: err
		});

		return { result: 'error', err };
	}
};
