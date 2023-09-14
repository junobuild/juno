<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { getPageViews, getTrackEvents } from '$lib/api/orbiter.api';
	import type { AnalyticKey, PageView, TrackEvent } from '$declarations/orbiter/orbiter.did';
	import Value from '$lib/components/ui/Value.svelte';
	import AnalyticsChart from '$lib/components/analytics/AnalyticsChart.svelte';
	import { isNullish } from '$lib/utils/utils';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import AnalyticsNew from '$lib/components/analytics/AnalyticsNew.svelte';
	import AnalyticsFilter from '$lib/components/analytics/AnalyticsFilter.svelte';
	import type { PageViewsPeriod } from '$lib/types/ortbiter';
	import { debounce } from '$lib/utils/debounce.utils';
	import { formatNumber } from '$lib/utils/number.utils';
	import AnalyticsEvents from '$lib/components/analytics/AnalyticsEvents.svelte';
	import AnalyticsReferrers from '$lib/components/analytics/AnalyticsReferrers.svelte';

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

	let uniqueSessions: number = 0;
	$: uniqueSessions = [...new Set(pageViews.map(([_, { session_id }]) => session_id))].length;

	let sessionsViews: Record<string, number> = {};
	$: sessionsViews = pageViews.reduce(
		(acc, [_, { session_id }]) => ({
			...acc,
			[session_id]: (acc[session_id] ?? 0) + 1
		}),
		{} as Record<string, number>
	);

	let sessionsUniqueViews: Record<string, Set<string>> = {};
	$: sessionsUniqueViews = pageViews.reduce(
		(acc, [_, { href, session_id }]) => ({
			...acc,
			[session_id]: (acc[session_id] ?? new Set()).add(href)
		}),
		{} as Record<string, Set<string>>
	);

	let uniquePageViews = 0;
	$: uniquePageViews = Object.entries(sessionsUniqueViews).reduce(
		(acc, value) => acc + value[1].size,
		0
	);

	let bounceRate = 0;
	$: bounceRate = Object.entries(sessionsViews).filter(([_key, value]) => value === 1).length;

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

		<div class="card-container">
			<Value>
				<svelte:fragment slot="label">{$i18n.analytics.number_of_sessions}</svelte:fragment>
				<p>{uniqueSessions}</p>
			</Value>

			<Value>
				<svelte:fragment slot="label">{$i18n.analytics.unique_page_views}</svelte:fragment>
				<p>{uniquePageViews}</p>
			</Value>

			<Value>
				<svelte:fragment slot="label">{$i18n.analytics.total_page_views}</svelte:fragment>
				<p>{pageViews.length}</p>
			</Value>

			<Value>
				<svelte:fragment slot="label"
					>{$i18n.analytics.average_page_views_per_session}</svelte:fragment
				>
				<p>{formatNumber(uniqueSessions > 0 ? uniqueSessions / pageViews.length : 0)}</p>
			</Value>

			<Value>
				<svelte:fragment slot="label">{$i18n.analytics.bounce_rate}</svelte:fragment>
				<p>{bounceRate}</p>
			</Value>
		</div>

		{#if pageViews.length > 0}
			<AnalyticsReferrers {pageViews} />
		{/if}

		{#if trackEvents.length > 0}
			<AnalyticsEvents {trackEvents} />
		{/if}
	{/if}

	{#if isNullish($orbiterStore)}
		<AnalyticsNew />
	{/if}
{/if}
