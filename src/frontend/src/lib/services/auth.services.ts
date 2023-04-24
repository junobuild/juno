import { authStore, type AuthSignInParams } from '$lib/stores/auth.store';
import { busy } from '$lib/stores/busy.store';
import { missionControlStore } from '$lib/stores/mission-control.store';
import { satellitesStore } from '$lib/stores/satellite.store';
import { toasts } from '$lib/stores/toasts.store';

const clearDataStores = () => {
	satellitesStore.set(null);
	missionControlStore.set(null);
};

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

export const signOut = async () => {
	await authStore.signOut();

	clearDataStores();
};

export const idleSignOut = async () => {
	await signOut();

	toasts.show({
		text: 'You have been logged out because your session has expired.',
		level: 'warn'
	});
};
