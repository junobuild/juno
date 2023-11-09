<script lang="ts">
	import type { AnalyticKey, TrackEvent } from '$declarations/orbiter/orbiter.did';
	import { i18n } from '$lib/stores/i18n.store';
	import { busy } from '$lib/stores/busy.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { filenameTimestamp, JSON_PICKER_OPTIONS, saveToCSVFile } from '$lib/utils/save.utils';
	import { jsonReplacer } from '@dfinity/utils';

	export let trackEvents: [AnalyticKey, TrackEvent][] = [];

	const exportEvents = async () => {
		busy.start();

		try {
			const json = JSON.stringify(trackEvents, jsonReplacer);

			await saveToCSVFile({
				blob: new Blob([json], {
					type: 'application/json'
				}),
				filename: `Juno_Analytics_Tracked_Events_${filenameTimestamp()}.json`,
				type: JSON_PICKER_OPTIONS
			});
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.analytics_tracked_events_export,
				detail: err
			});
		}

		busy.stop();
	};
</script>

<button type="button" on:click={exportEvents}>{$i18n.core.export}</button>
