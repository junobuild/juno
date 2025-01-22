<script lang="ts">
	import { jsonReplacer } from '@dfinity/utils';
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import { getTrackEvents } from '$lib/api/orbiter.api';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { PageViewsParams, PageViewsPeriod } from '$lib/types/ortbiter';
	import { filenameTimestamp, JSON_PICKER_OPTIONS, saveToFileSystem } from '$lib/utils/save.utils';
	import { satelliteStore } from '$lib/derived/satellite.derived';

	interface Props {
		period?: PageViewsPeriod;
		orbiter: Orbiter;
	}

	let { period = {}, orbiter }: Props = $props();

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

			await saveToFileSystem({
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

<button type="button" onclick={exportEvents}>{$i18n.core.export}</button>
