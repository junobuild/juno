import { authStore } from '$lib/stores/auth.store';
import { missionControlStore } from '$lib/stores/mission-control.store';
import { satellitesStore } from '$lib/stores/satellite.store';
import { toasts } from '$lib/stores/toasts.store';

const clearDataStores = () => {
	satellitesStore.set(null);
	missionControlStore.set(null);
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
