<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { exportTrackEvents } from '$lib/services/orbiter.export.services';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type {
		PageViewsParams,
		PageViewsOptionPeriod,
		AnalyticsPeriodicity
	} from '$lib/types/orbiter';

	interface Props {
		period?: PageViewsOptionPeriod;
		periodicity: AnalyticsPeriodicity;
		orbiter: Orbiter;
	}

	let { period = {}, periodicity, orbiter }: Props = $props();

	const exportEvents = async () => {
		const { from, ...restPeriod } = period;

		if (isNullish(from)) {
			toasts.warn($i18n.analytics.warn_no_from);
			return;
		}

		busy.start();

		const params: PageViewsParams = {
			satelliteId: $satelliteStore?.satellite_id,
			orbiterId: orbiter.orbiter_id,
			identity: $authStore.identity,
			...periodicity,
			from,
			...restPeriod
		};

		await exportTrackEvents({ params });

		busy.stop();
	};
</script>

<button type="button" onclick={exportEvents}>{$i18n.core.export}</button>
