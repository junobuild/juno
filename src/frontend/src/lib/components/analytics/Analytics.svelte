<script lang="ts">
	import { isNullish, nonNullish, debounce } from '@dfinity/utils';
	import { addMonths } from 'date-fns';
	import { run } from 'svelte/legacy';
	import type {
		AnalyticsTrackEvents,
		AnalyticsWebVitalsPerformanceMetrics
	} from '$declarations/orbiter/orbiter.did';
	import AnalyticsChart from '$lib/components/analytics/AnalyticsChart.svelte';
	import AnalyticsEvents from '$lib/components/analytics/AnalyticsEvents.svelte';
	import AnalyticsEventsExport from '$lib/components/analytics/AnalyticsEventsExport.svelte';
	import AnalyticsFilter from '$lib/components/analytics/AnalyticsFilter.svelte';
	import AnalyticsMetrics from '$lib/components/analytics/AnalyticsMetrics.svelte';
	import AnalyticsNew from '$lib/components/analytics/AnalyticsNew.svelte';
	import AnalyticsPageViews from '$lib/components/analytics/AnalyticsPageViews.svelte';
	import AnalyticsPerformanceMetrics from '$lib/components/analytics/AnalyticsPerformanceMetrics.svelte';
	import NoAnalytics from '$lib/components/analytics/NoAnalytics.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import {
		getAnalyticsPageViews,
		getAnalyticsPerformanceMetrics,
		getAnalyticsTrackEvents
	} from '$lib/services/orbiters.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';
	import type {
		AnalyticsPageViews as AnalyticsPageViewsType,
		PageViewsParams,
		PageViewsPeriod
	} from '$lib/types/ortbiter';

	let loading = $state(true);

	let pageViews: AnalyticsPageViewsType | undefined = $state(undefined);
	let trackEvents: AnalyticsTrackEvents | undefined = $state(undefined);
	let performanceMetrics: AnalyticsWebVitalsPerformanceMetrics | undefined = $state(undefined);

	let period: PageViewsPeriod = $state({
		from: addMonths(new Date(), -1)
	});

	const loadAnalytics = async () => {
		if (isNullish($orbiterStore)) {
			loading = false;
			return;
		}

		if (isNullish($versionStore.orbiter) || isNullish($versionStore.orbiter?.current)) {
			return;
		}

		try {
			const params: PageViewsParams = {
				satelliteId: $satelliteStore?.satellite_id,
				orbiterId: $orbiterStore.orbiter_id,
				identity: $authStore.identity,
				...period
			};

			const [views, events, metrics] = await Promise.all([
				getAnalyticsPageViews({ params, orbiterVersion: $versionStore.orbiter.current }),
				getAnalyticsTrackEvents({ params, orbiterVersion: $versionStore.orbiter.current }),
				getAnalyticsPerformanceMetrics({ params, orbiterVersion: $versionStore.orbiter.current })
			]);

			pageViews = views;
			trackEvents = events;
			performanceMetrics = metrics;

			loading = false;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.analytics_load_error,
				detail: err
			});
		}
	};

	const debouncePageViews = debounce(loadAnalytics);

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		$orbiterStore, $satelliteStore, $versionStore, period, debouncePageViews();
	});

	const selectPeriod = ({ detail }: CustomEvent<PageViewsPeriod>) => (period = detail);
</script>

{#if loading}
	<SpinnerParagraph>{$i18n.analytics.loading}</SpinnerParagraph>
{:else}
	{#if isNullish($orbiterStore) || isNullish(pageViews)}
		<NoAnalytics />
	{:else}
		<AnalyticsFilter on:junoPeriod={selectPeriod} />

		<AnalyticsChart data={pageViews} />

		<AnalyticsMetrics {pageViews} />

		<AnalyticsPageViews {pageViews} />

		{#if nonNullish(performanceMetrics) && performanceMetrics.pages.length > 0}
			<hr />

			<AnalyticsPerformanceMetrics {performanceMetrics} />
		{/if}

		{#if nonNullish(trackEvents) && trackEvents.total.length > 0}
			<hr />

			<AnalyticsEvents {trackEvents} />

			<AnalyticsEventsExport orbiter={$orbiterStore} {period} />
		{/if}
	{/if}

	{#if isNullish($orbiterStore)}
		<AnalyticsNew />
	{/if}
{/if}
