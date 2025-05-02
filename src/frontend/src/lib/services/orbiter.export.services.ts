import type { AnalyticKey, PageView } from '$declarations/orbiter/orbiter.did';
import { getPageViews, getTrackEvents } from '$lib/api/orbiter.api';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { PageViewsParams, PageViewsPeriod } from '$lib/types/orbiter';
import { formatDateToDateString } from '$lib/utils/date.utils';
import { batchAnalyticsRequests } from '$lib/utils/orbiter.paginated.utils';
import { buildAnalyticsPeriods } from '$lib/utils/orbiter.utils';
import {
	download,
	filenameTimestamp,
	JSON_PICKER_OPTIONS,
	saveToFileSystem
} from '$lib/utils/save.utils';
import { jsonReplacer } from '@dfinity/utils';
import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
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

export const exportPageViews = async (params: {
	params: PageViewsParams;
}): Promise<{ success: boolean }> => {
	try {
		const blob = await collectAndZipPageViews(params);

		// We use download because of the following issue when using the file picker
		// Failed to execute 'showSaveFilePicker' on 'Window': Must be handling a user gesture to show a file picker.
		download({
			filename: `Juno_Analytics_Page_Views_${filenameTimestamp()}.zip`,
			blob
		});

		return { success: true };
	} catch (err: unknown) {
		toasts.error({
			text: get(i18n).errors.analytics_page_views_export,
			detail: err
		});

		return { success: false };
	}
};

const collectAndZipPageViews = async ({ params }: { params: PageViewsParams }): Promise<Blob> => {
	const periods = buildAnalyticsPeriods({ params });

	type Result = { period: PageViewsPeriod; pageViews: [AnalyticKey, PageView][] };

	const fn = async ({ period }: { period: Required<PageViewsPeriod> }): Promise<Result> => ({
		period,
		pageViews: await getPageViews({
			...params,
			...period
		})
	});

	const pageViewsByPeriods = await batchAnalyticsRequests<Result>({
		periods,
		fn
	});

	const zipWriter = new ZipWriter(new BlobWriter('application/zip'), { bufferedWrite: true });

	for (const { period, pageViews } of pageViewsByPeriods) {
		const reader = new TextReader(JSON.stringify(pageViews, jsonReplacer));
		const filename = `Page_Views_${formatDateToDateString(period.from)}.json`;

		await zipWriter.add(filename, reader);
	}

	return await zipWriter.close();
};
