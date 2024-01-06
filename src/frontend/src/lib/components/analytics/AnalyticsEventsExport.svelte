<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { busy } from '$lib/stores/busy.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { filenameTimestamp, JSON_PICKER_OPTIONS, saveToCSVFile } from '$lib/utils/save.utils';
	import { jsonReplacer } from '@dfinity/utils';
	import type { PageViewsParams, PageViewsPeriod } from '$lib/types/ortbiter';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import { authStore } from '$lib/stores/auth.store';
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
    import {getTrackEvents} from "$lib/api/orbiter.api";

	export let period: PageViewsPeriod = {};
	export let orbiter: Orbiter;

	const exportEvents = async () => {
		busy.start();

		try {
			const params: PageViewsParams = {
				satelliteId: $satelliteStore?.satellite_id,
				orbiterId: orbiter.orbiter_id,
				identity: $authStore.identity,
				...period
			};

            const trackEvents = await getTrackEvents(params);

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
