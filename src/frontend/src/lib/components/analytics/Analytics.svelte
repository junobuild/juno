<script lang="ts">
	import { isNullish, nonNullish, debounce } from '@dfinity/utils';
	import { addMonths } from 'date-fns';
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
	import { orbiterFeatures } from '$lib/derived/orbiter-satellites.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { getAnalyticsPageViewsPerDay } from '$lib/services/orbiter.paginated.services';
	import {
		getAnalyticsPerformanceMetrics,
		getAnalyticsTrackEvents,
		loadOrbiterConfigs
	} from '$lib/services/orbiters.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';
	import type {
		AnalyticsPageViews as AnalyticsPageViewsType,
		PageViewsParams,
		PageViewsOptionPeriod
	} from '$lib/types/ortbiter';

	let loading: 'in_progress' | 'success' | 'error' = $state('in_progress');

	let pageViews: AnalyticsPageViewsType | undefined = $state(undefined);
	let trackEvents: AnalyticsTrackEvents | undefined = $state(undefined);
	let performanceMetrics: AnalyticsWebVitalsPerformanceMetrics | undefined = $state(undefined);

	let period: PageViewsOptionPeriod = $state({
		from: addMonths(new Date(), -1)
	});

	const loadAnalytics = async () => {
		if (isNullish($orbiterStore)) {
			loading = 'success';
			return;
		}

		if (isNullish($versionStore.orbiter) || isNullish($versionStore.orbiter?.current)) {
			return;
		}

		const { result } = await loadOrbiterConfigs({
			orbiterId: $orbiterStore.orbiter_id,
			orbiterVersion: $versionStore.orbiter.current,
			reload: false
		});

		if (result === 'error') {
			loading = 'error';
			return;
		}

		const { from, ...restPeriod } = period;

		if (isNullish(from)) {
			toasts.warn($i18n.analytics.warn_no_from);
			return;
		}

		try {
			const params: PageViewsParams = {
				satelliteId: $satelliteStore?.satellite_id,
				orbiterId: $orbiterStore.orbiter_id,
				identity: $authStore.identity,
				from,
				...restPeriod
			};

			// We need the page views to display some statistics currently
			const promises = [
				getAnalyticsPageViewsPerDay({ params, orbiterVersion: $versionStore.orbiter.current }),
				...[
					$orbiterFeatures?.track_events === true
						? getAnalyticsTrackEvents({ params, orbiterVersion: $versionStore.orbiter.current })
						: Promise.resolve()
				],
				...[
					$orbiterFeatures?.performance_metrics === true
						? getAnalyticsPerformanceMetrics({
								params,
								orbiterVersion: $versionStore.orbiter.current
							})
						: Promise.resolve()
				]
			];

			const [views, events, metrics] = await Promise.all(promises);

			pageViews = views as AnalyticsPageViewsType | undefined;
			trackEvents = events as AnalyticsTrackEvents | undefined;
			performanceMetrics = metrics as AnalyticsWebVitalsPerformanceMetrics | undefined;

			loading = 'success';
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.analytics_load_error,
				detail: err
			});

			loading = 'error';
		}
	};

	const debounceLoadAnalytics = debounce(loadAnalytics);

	$effect(() => {
		$orbiterStore;
		$versionStore;

		debounceLoadAnalytics();
	});

	const selectPeriod = (detail: PageViewsOptionPeriod) => (period = detail);
</script>

{#if loading === 'in_progress'}
	<div class="loading">
		<SpinnerParagraph>{$i18n.analytics.loading}</SpinnerParagraph>
	</div>
{:else}
	{#if nonNullish($orbiterStore)}
		<AnalyticsFilter {selectPeriod} {loadAnalytics} />
	{/if}

	{#if isNullish($orbiterStore) && loading === 'success'}
		<NoAnalytics />
	{:else if nonNullish($orbiterStore) && loading === 'error'}
		<p>{$i18n.analytics.error_msg}</p>
	{:else if nonNullish($orbiterStore) && nonNullish(pageViews)}
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

<style lang="scss">
	.loading {
		margin: calc(var(--padding-3x) + var(--padding-0_5x)) 0 0;
	}
</style>
