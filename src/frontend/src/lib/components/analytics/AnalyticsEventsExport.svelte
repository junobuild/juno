<script lang="ts">
	import { isNullish, jsonReplacer } from '@dfinity/utils';
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import { getTrackEvents } from '$lib/api/orbiter.api';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { exportTrackEvents } from '$lib/services/orbiter.export.services';
	import { analyticsFiltersStore } from '$lib/stores/analytics-filters.store';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type {
		PageViewsParams,
		PageViewsOptionPeriod,
		AnalyticsPeriodicity
	} from '$lib/types/orbiter';
	import { filenameTimestamp, JSON_PICKER_OPTIONS, saveToFileSystem } from '$lib/utils/save.utils';

	interface Props {
		orbiter: Orbiter;
	}

	let { orbiter }: Props = $props();

	const exportEvents = async () => {
		const { from, ...restPeriod } = $analyticsFiltersStore;

		if (isNullish(from)) {
			toasts.warn($i18n.analytics.warn_no_from);
			return;
		}

		busy.start();

		const params: PageViewsParams = {
			satelliteId: $satelliteStore?.satellite_id,
			orbiterId: orbiter.orbiter_id,
			identity: $authStore.identity,
			from,
			...restPeriod
		};

		await exportTrackEvents({ params });

		busy.stop();
	};
</script>

<button type="button" onclick={exportEvents}>{$i18n.core.export}</button>
