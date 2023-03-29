import { authStore } from '$lib/stores/auth.store';
import { missionControlStore } from '$lib/stores/mission-control.store';
import { satellitesStore } from '$lib/stores/satellite.store';
import { toasts } from '$lib/stores/toasts.store';

const clearDataStores = () => {
	satellitesStore.set(null);
	missionControlStore.set(null);
};

export const signIn = async (
	invitationCode: string | undefined = undefined
): Promise<{ success: 'ok' | 'cancelled' | 'error'; err?: unknown }> => {
	try {
		await authStore.signIn(invitationCode !== '' ? invitationCode : undefined);

		return { success: 'ok' };
	} catch (err: unknown) {
		if (err === 'UserInterrupt') {
			// We do not display an error if user explicitly cancelled the process of sign-ion
			return { success: 'cancelled' };
		}

		toasts.error({
			text: `Something went wrong while sign-in.`,
			detail: err
		});

		return { success: 'error', err };
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
