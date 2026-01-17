import { CONSOLE_CANISTER_ID, GOOGLE_CLIENT_ID } from '$lib/constants/app.constants';
import { AuthClientProvider } from '$lib/providers/auth-client.provider';
import {
	clearAuthNavOrigin,
	saveAuthNavOrigin
} from '$lib/services/console/auth/_auth.nav.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { authStore } from '$lib/stores/auth.store';
import type { SignInOpenIdProvider } from '$lib/types/auth';
import { SignInInitError } from '$lib/types/errors';
import { container } from '$lib/utils/juno.utils';
import { isNullish } from '@dfinity/utils';
import { authenticate, requestJwt } from '@junobuild/auth';
import { get } from 'svelte/store';

export const signInWithGoogle = async () => {
	await signInWithOpenId({
		clientId: GOOGLE_CLIENT_ID,
		provider: 'google'
	});
};

// TODO: extract client ID to juno.config
export const signInWithGitHub = async () => {
	await signInWithOpenId({
		clientId: 'Ov23li92ijrrPEfwUrqW',
		provider: 'github'
	});
};

type SignInWithOpenIdParams = { provider: SignInOpenIdProvider; clientId: string | undefined };

const signInWithOpenId = async (params: SignInWithOpenIdParams) => {
	try {
		saveAuthNavOrigin();

		await signInWithOpenIdFn(params);
	} catch (err: unknown) {
		clearAuthNavOrigin();

		toasts.error({
			text: get(i18n).errors.sign_in,
			detail: err
		});
	}
};

const signInWithOpenIdFn = async ({ clientId, provider }: SignInWithOpenIdParams) => {
	if (isNullish(clientId)) {
		throw new SignInInitError(
			'Sign-in cannot be initialized because the associated client ID is not configured.'
		);
	}

	const {
		location: { origin }
	} = window;

	const payload = {
		redirect: {
			clientId,
			redirectUrl: `${origin}/auth/callback/${provider}`
		}
	};

	await requestJwt(
		provider === 'github'
			? {
					github: payload
				}
			: {
					google: payload
				}
	);
};

const authenticateWithOpenID = async ({ provider }: { provider: SignInOpenIdProvider }) => {
	const payload = {
		redirect: null,
		auth: {
			console: {
				consoleId: CONSOLE_CANISTER_ID,
				...container()
			}
		}
	};

	const {
		identity: { delegationChain, sessionKey }
	} = await authenticate(
		provider === 'github'
			? {
					github: payload
				}
			: {
					google: payload
				}
	);

	await AuthClientProvider.getInstance().setAuthClientStorage({
		delegationChain,
		sessionKey
	});
};

export const handleRedirectCallback = async ({
	provider
}: {
	provider: SignInOpenIdProvider;
}): Promise<{
	result: 'ok' | 'error';
	err?: unknown;
}> => {
	try {
		const signInFn = async () => await authenticateWithOpenID({ provider });

		await authStore.signInWithOpenId({ signInFn });

		return { result: 'ok' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.stack_trace,
			detail: err
		});

		return { result: 'error', err };
	}
};
