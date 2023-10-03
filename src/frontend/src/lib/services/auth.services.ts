import { authStore, type AuthSignInParams } from '$lib/stores/auth.store';
import { busy } from '$lib/stores/busy.store';
import { toasts } from '$lib/stores/toasts.store';
import type {ToastLevel, ToastMsg} from '$lib/types/toast';
import {replaceHistory} from "$lib/utils/route.utils";
import {isNullish} from "$lib/utils/utils";

export const signIn = async (
	params: AuthSignInParams
): Promise<{ success: 'ok' | 'cancelled' | 'error'; err?: unknown }> => {
	busy.show();

	try {
		await authStore.signIn(params);

		return { success: 'ok' };
	} catch (err: unknown) {
		if (err === 'UserInterrupt') {
			// We do not display an error if user explicitly cancelled the process of sign-in
			return { success: 'cancelled' };
		}

		toasts.error({
			text: `Something went wrong while sign-in.`,
			detail: err
		});

		return { success: 'error', err };
	} finally {
		busy.stop();
	}
};

export const signOut = (): Promise<void> => logout({});

export const idleSignOut = async () =>
	logout({
		msg: {
			text: 'You have been logged out because your session has expired.',
			level: 'warn'
		}
	});

const logout = async ({ msg = undefined }: { msg?: ToastMsg }) => {
	// To mask not operational UI (a side effect of sometimes slow JS loading after window.reload because of service worker and no cache).
	busy.start();

	await authStore.signOut();

	if (msg) {
		appendMsgToUrl(msg);
	}

	// Auth: Delegation and identity are cleared from indexedDB by agent-js so, we do not need to clear these

	// Preferences: We do not clear local storage as well. It contains anonymous information such as the selected theme.
	// Information the user want to preserve across sign-in. e.g. if I select the light theme, logout and sign-in again, I am happy if the dapp still uses the light theme.

	// We reload the page to make sure all the states are cleared
	window.location.reload();
};

const PARAM_MSG = 'msg';
const PARAM_LEVEL = 'level';

/**
 * If a message was provided to the logout process - e.g. a message informing the logout happened because the session timed-out - append the information to the url as query params
 */
const appendMsgToUrl = (msg: ToastMsg) => {
	const { text, level } = msg;

	const url: URL = new URL(window.location.href);

	url.searchParams.append(PARAM_MSG, encodeURI(text));
	url.searchParams.append(PARAM_LEVEL, level);

	replaceHistory(url);
};

/**
 * If the url contains a msg that has been provided on logout, display it as a toast message. Cleanup url afterwards - we don't want the user to see the message again if reloads the browser
 */
export const displayAndCleanLogoutMsg = () => {
	const urlParams: URLSearchParams = new URLSearchParams(window.location.search);

	const msg: string | null = urlParams.get(PARAM_MSG);

	if (isNullish(msg)) {
		return;
	}

	// For simplicity reason we assume the level pass as query params is one of the type ToastLevel
	const level: ToastLevel = (urlParams.get(PARAM_LEVEL) as ToastLevel | null) ?? 'info';

	toasts.show({ text: decodeURI(msg), level });

	cleanUpMsgUrl();
};

const cleanUpMsgUrl = () => {
	const url: URL = new URL(window.location.href);

	url.searchParams.delete(PARAM_MSG);
	url.searchParams.delete(PARAM_LEVEL);

	replaceHistory(url);
};
