import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import { versionStore } from '$lib/stores/version.store';
import type { PostMessageDataResponseRegistry } from '$lib/types/post-message';
import { get } from 'svelte/store';

export const onSyncRegistry = ({ registry }: PostMessageDataResponseRegistry) => {
	versionStore.setAll(registry);
};

export const onRegistryError = ({ error: err }: { error: unknown }) => {
	versionStore.reset();

	toasts.error({
		text: get(i18n).errors.load_version,
		detail: err
	});
};
