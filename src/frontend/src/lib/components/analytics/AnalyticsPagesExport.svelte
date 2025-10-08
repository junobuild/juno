<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { exportPageViews } from '$lib/services/orbiter/orbiter.export.services';
	import { analyticsFiltersStore } from '$lib/stores/analytics-filters.store';
	import { authStore } from '$lib/stores/auth.store';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { MissionControlDid } from '$lib/types/declarations';
	import type { PageViewsParams } from '$lib/types/orbiter';

	interface Props {
		orbiter: MissionControlDid.Orbiter;
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

		await exportPageViews(params);

		busy.stop();
	};
</script>

<button onclick={exportEvents} type="button">{$i18n.core.export}</button>
