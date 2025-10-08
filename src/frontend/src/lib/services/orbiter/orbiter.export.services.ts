import type { OrbiterDid } from '$declarations';
import { getPageViews, getTrackEvents } from '$lib/api/orbiter.api';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import type { PageViewsParams, PageViewsPeriod } from '$lib/types/orbiter';
import { formatDateToDateString } from '$lib/utils/date.utils';
import {
	batchAnalyticsRequests,
	type BatchPeriodsRequestsParams
} from '$lib/utils/orbiter.paginated.utils';
import { buildAnalyticsPeriods } from '$lib/utils/orbiter.utils';
import { download, filenameTimestamp } from '$lib/utils/save.utils';
import { jsonReplacer } from '@dfinity/utils';
import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import { get } from 'svelte/store';

export const exportTrackEvents = async (params: PageViewsParams): Promise<{ success: boolean }> => {
	const fn = ({
		period
	}: {
		period: Required<PageViewsPeriod>;
	}): Promise<[OrbiterDid.AnalyticKey, OrbiterDid.TrackEvent][]> =>
		getTrackEvents({
			...params,
			...period
		});

	try {
		await executeExport<OrbiterDid.TrackEvent>({
			params,
			filename: `Juno_Analytics_Tracked_Events_${filenameTimestamp()}.zip`,
			fn
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

export const exportPageViews = async (params: PageViewsParams): Promise<{ success: boolean }> => {
	const fn = ({
		period
	}: {
		period: Required<PageViewsPeriod>;
	}): Promise<[OrbiterDid.AnalyticKey, OrbiterDid.PageView][]> =>
		getPageViews({
			...params,
			...period
		});

	try {
		await executeExport<OrbiterDid.PageView>({
			params,
			filename: `Juno_Analytics_Page_Views_${filenameTimestamp()}.zip`,
			fn
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

const executeExport = async <T>({
	filename,
	...params
}: {
	params: PageViewsParams;
	filename: string;
} & Pick<BatchPeriodsRequestsParams<[OrbiterDid.AnalyticKey, T][]>, 'fn'>): Promise<void> => {
	const blob = await collectAndZip(params);

	// We use download because of the following issue when using the file picker
	// Failed to execute 'showSaveFilePicker' on 'Window': Must be handling a user gesture to show a file picker.
	download({
		filename,
		blob
	});
};

const collectAndZip = async <T>({
	params,
	fn
}: { params: PageViewsParams } & Pick<
	BatchPeriodsRequestsParams<[OrbiterDid.AnalyticKey, T][]>,
	'fn'
>): Promise<Blob> => {
	const periods = buildAnalyticsPeriods({ params });

	interface Result {
		period: PageViewsPeriod;
		data: [OrbiterDid.AnalyticKey, T][];
	}

	const executeFn = async ({ period }: { period: Required<PageViewsPeriod> }): Promise<Result> => ({
		period,
		data: await fn({ period })
	});

	const pageViewsByPeriods = await batchAnalyticsRequests<Result>({
		periods,
		fn: executeFn
	});

	const zipWriter = new ZipWriter(new BlobWriter('application/zip'), { bufferedWrite: true });

	for (const { period, data } of pageViewsByPeriods) {
		const reader = new TextReader(JSON.stringify(data, jsonReplacer));
		const filename = `Page_Views_${formatDateToDateString(period.from)}.json`;

		await zipWriter.add(filename, reader);
	}

	return await zipWriter.close();
};
