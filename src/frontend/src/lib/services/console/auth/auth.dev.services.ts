import { type DevIdentifier, unsafeDevSignIn } from 'icp-dev-identity';
import { busy } from '$lib/stores/app/busy.store';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { authStore } from '$lib/stores/auth.store';
import { get } from 'svelte/store';

export const signInWithDev = async (params: {
	identifier?: DevIdentifier;
}): Promise<{
	success: 'ok' | 'cancelled' | 'error';
	err?: unknown;
}> => {
	busy.show();

	try {
		const signInFn = () => unsafeDevSignIn(params);

		await authStore.signInWithII({ signInFn });

		return { success: 'ok' };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.sign_in,
			detail: err
		});

		return { success: 'error', err };
	} finally {
		busy.stop();
	}
};
