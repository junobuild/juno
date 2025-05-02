import { getTrackEvents } from '$lib/api/orbiter.api';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { PageViewsParams } from '$lib/types/orbiter';
import { filenameTimestamp, JSON_PICKER_OPTIONS, saveToFileSystem } from '$lib/utils/save.utils';
import { jsonReplacer } from '@dfinity/utils';
import { get } from 'svelte/store';

export const exportTrackEvents = async ({
	params
}: {
	params: PageViewsParams;
}): Promise<{ success: boolean }> => {
	try {
		const trackEvents = await getTrackEvents(params);

		const json = JSON.stringify(trackEvents, jsonReplacer);

		await saveToFileSystem({
			blob: new Blob([json], {
				type: 'application/json'
			}),
			filename: `Juno_Analytics_Tracked_Events_${filenameTimestamp()}.json`,
			type: JSON_PICKER_OPTIONS
		});

		return { success: true };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.analytics_tracked_events_export,
			detail: err
		});

		return { success: false };
	}
};
