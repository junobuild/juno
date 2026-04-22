<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import type { MissionControlDid } from '$declarations';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { satellite } from '$lib/derived/satellite.derived';
	import { exportPageViews } from '$lib/services/orbiter/orbiter.export.services';
	import { busy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { analyticsFiltersStore } from '$lib/stores/orbiter/analytics-filters.store';
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
			satelliteId: $satellite?.satellite_id,
			orbiterId: orbiter.orbiter_id,
			identity: $authIdentity,
			from,
			...restPeriod
		};

		await exportPageViews(params);

		busy.stop();
	};
</script>

<button onclick={exportEvents} type="button">{$i18n.core.export}</button>
