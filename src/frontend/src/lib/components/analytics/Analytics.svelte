<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { getPageViews, getTrackEvents } from '$lib/api/orbiter.api';
	import type { AnalyticKey, PageView, TrackEvent } from '$declarations/orbiter/orbiter.did';
	import Value from '$lib/components/ui/Value.svelte';
	import AnalyticsChart from '$lib/components/analytics/AnalyticsChart.svelte';
	import { isNullish } from '@dfinity/utils';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import AnalyticsNew from '$lib/components/analytics/AnalyticsNew.svelte';
	import AnalyticsFilter from '$lib/components/analytics/AnalyticsFilter.svelte';
	import type { PageViewsPeriod } from '$lib/types/ortbiter';
	import { debounce } from '@dfinity/utils';
	import { formatNumber } from '$lib/utils/number.utils';
	import AnalyticsEvents from '$lib/components/analytics/AnalyticsEvents.svelte';
	import AnalyticsEventsExport from '$lib/components/analytics/AnalyticsEventsExport.svelte';
	import AnalyticsPageViews from '$lib/components/analytics/AnalyticsPageViews.svelte';
	import AnalyticsMetrics from '$lib/components/analytics/AnalyticsMetrics.svelte';

	let loading = true;

	let pageViews: [AnalyticKey, PageView][] = [];
	let trackEvents: [AnalyticKey, TrackEvent][] = [];

	let period: PageViewsPeriod = {};

	const loadAnalytics = async () => {
		if (isNullish($orbiterStore)) {
			loading = false;
			return;
		}

		try {
			const params = {
				satelliteId: $satelliteStore?.satellite_id,
				orbiterId: $orbiterStore.orbiter_id,
				...period
			};

			const [views, events] = await Promise.all([getPageViews(params), getTrackEvents(params)]);

			pageViews = views as [AnalyticKey, PageView][];
			trackEvents = events as [AnalyticKey, TrackEvent][];

			loading = false;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.analytics_load_error,
				detail: err
			});
		}
	};

	const debouncePageViews = debounce(loadAnalytics);

	$: $orbiterStore, $satelliteStore, period, debouncePageViews();

	const selectPeriod = ({ detail }: CustomEvent<PageViewsPeriod>) => (period = detail);
</script>

{#if loading}
	<SpinnerParagraph>{$i18n.analytics.loading}</SpinnerParagraph>
{:else}
	{#if isNullish($orbiterStore)}
		<div class="card-container">
			<p>{$i18n.analytics.empty}</p>
		</div>
	{:else}
		<AnalyticsFilter on:junoPeriod={selectPeriod} />

		{#if pageViews.length > 0}
			<AnalyticsChart data={pageViews} />
		{/if}

		<AnalyticsMetrics {pageViews} />

		<AnalyticsPageViews {pageViews} />

		{#if trackEvents.length > 0}
			<hr />

			<AnalyticsEvents {trackEvents} />

			<AnalyticsEventsExport {trackEvents} />
		{/if}
	{/if}

	{#if isNullish($orbiterStore)}
		<AnalyticsNew />
	{/if}
{/if}
