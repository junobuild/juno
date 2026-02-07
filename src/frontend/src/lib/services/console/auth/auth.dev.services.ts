import { AuthClientProvider } from '$lib/providers/auth-client.provider';
import { busy } from '$lib/stores/app/busy.store';
import { i18n } from '$lib/stores/app/i18n.store';
import { toasts } from '$lib/stores/app/toasts.store';
import { authStore } from '$lib/stores/auth.store';
import { type DevIdentifier, generateUnsafeDevIdentity } from '@junobuild/ic-client/dev';
import { get } from 'svelte/store';

export const signInWithDev = async (params: {
	identifier?: DevIdentifier;
}): Promise<{
	success: 'ok' | 'cancelled' | 'error';
	err?: unknown;
}> => {
	busy.show();

	try {
		const signInFn = async () => {
			const { sessionKey, delegationChain } = await generateUnsafeDevIdentity(params);

			await AuthClientProvider.getInstance().setAuthClientStorage({
				delegationChain,
				sessionKey
			});
		};

		await authStore.signInWithOpenId({ signInFn });

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
