import {
	CONSOLE_CANISTER_ID,
	GITHUB_CLIENT_ID,
	GOOGLE_CLIENT_ID
} from '$lib/constants/app.constants';
import { AuthClientProvider } from '$lib/providers/auth-client.provider';
import {
	clearAuthNavOrigin,
	saveAuthNavOrigin
} from '$lib/services/console/auth/_auth.nav.services';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { authStore } from '$lib/stores/auth.store';
import type { OpenIdAuthProvider } from '$lib/types/auth';
import { SignInInitError } from '$lib/types/errors';
import { container } from '$lib/utils/juno.utils';
import { isNullish, nonNullish } from '@dfinity/utils';
import {
	authenticate,
	type AuthenticationGitHubRedirect,
	type RequestGitHubJwtRedirect,
	requestJwt
} from '@junobuild/auth';
import { get } from 'svelte/store';

export const signInWithGoogle = async () => {
	await signInWithOpenId({
		clientId: GOOGLE_CLIENT_ID,
		provider: 'google'
	});
};

export const signInWithGitHub = async () => {
	const JUNO_API_URL = import.meta.env.VITE_JUNO_API_URL;

	await signInWithOpenId<Pick<RequestGitHubJwtRedirect, 'initUrl'>>({
		clientId: GITHUB_CLIENT_ID,
		provider: 'github',
		...(nonNullish(JUNO_API_URL) && {
			extraArgs: {
				initUrl: `${JUNO_API_URL}/v1/auth/init/github`
			}
		})
	});
};

interface SignInWithOpenIdParams<T> {
	clientId: string | undefined;
	provider: OpenIdAuthProvider;
	extraArgs?: T;
}

const signInWithOpenId = async <T>(params: SignInWithOpenIdParams<T>) => {
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

const signInWithOpenIdFn = async <T>({
	clientId,
	provider,
	extraArgs
}: SignInWithOpenIdParams<T>) => {
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
			redirectUrl: `${origin}/auth/callback/${provider}`,
			...(extraArgs ?? {})
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

type AuthenticateWithOpenIdRedirectParams =
	| { github: AuthenticationGitHubRedirect | null }
	| { google: null };

const authenticateWithOpenID = async (params: AuthenticateWithOpenIdRedirectParams) => {
	const payload = {
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
		'github' in params
			? {
					github: {
						redirect: params.github,
						...payload
					}
				}
			: {
					google: {
						redirect: null,
						...payload
					}
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
	provider: OpenIdAuthProvider;
}): Promise<{
	result: 'ok' | 'error';
	err?: unknown;
}> => {
	try {
		const buildRedirect = (): AuthenticateWithOpenIdRedirectParams => {
			if (provider === 'google') {
				return { google: null };
			}

			const JUNO_API_URL = import.meta.env.VITE_JUNO_API_URL;

			return {
				github: nonNullish(JUNO_API_URL)
					? {
							finalizeUrl: `${JUNO_API_URL}/v1/auth/finalize/github`
						}
					: null
			};
		};

		const signInFn = async () => await authenticateWithOpenID(buildRedirect());

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
