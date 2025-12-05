import { notificationPreferencesStore } from '$lib/stores/app/notification-preferences.store';
import { derived } from 'svelte/store';

export const notificationFreezingThresholdEnabled = derived(
	[notificationPreferencesStore],
	([$notificationPreferencesStore]) => $notificationPreferencesStore.freezingThreshold !== false
);
