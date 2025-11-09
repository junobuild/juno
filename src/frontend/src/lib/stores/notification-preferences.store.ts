import type { NotificationPreferences } from '$lib/types/notification';
import { getLocalStorageNotificationPreferences } from '$lib/utils/local-storage.utils';
import { type Readable, writable } from 'svelte/store';

export interface NotificationPreferencesStore extends Readable<NotificationPreferences> {
	dismissFreezingThreshold: () => void;
}

export const initNotificationPreferencesStore = (): NotificationPreferencesStore => {
	const { subscribe, update } = writable<NotificationPreferences>(
		getLocalStorageNotificationPreferences()
	);

	return {
		subscribe,

		dismissFreezingThreshold() {
			update((state) => ({
				...state,
				freezingThreshold: false
			}));
		}
	};
};

export const notificationPreferencesStore = initNotificationPreferencesStore();
