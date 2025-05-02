<script lang="ts">
	import { isNullish, nonNullish, debounce } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
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
	import Warning from '$lib/components/ui/Warning.svelte';
	import { orbiterFeatures } from '$lib/derived/orbiter-satellites.derived';
	import { orbitersStore, orbiterStore } from '$lib/derived/orbiter.derived';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { getAnalyticsPageViewsPerDay } from '$lib/services/orbiter.paginated.services';
	import {
		getAnalyticsPerformanceMetrics,
		getAnalyticsTrackEvents,
		loadOrbiterConfigs
	} from '$lib/services/orbiters.services';
	import { analyticsFiltersStore } from '$lib/stores/analytics-filters.store';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';
	import type {
		AnalyticsPageViews as AnalyticsPageViewsType,
		PageViewsParams
	} from '$lib/types/orbiter';

	let loadingOrbiter: 'in_progress' | 'done' | 'error' = $state('in_progress');
	let reloadingAnalytics: 'idle' | 'in_progress' | 'loaded' | 'error' = $state('idle');

	let pageViews: AnalyticsPageViewsType | undefined = $state(undefined);
	let trackEvents: AnalyticsTrackEvents | undefined = $state(undefined);
	let performanceMetrics: AnalyticsWebVitalsPerformanceMetrics | undefined = $state(undefined);

	const loadAnalytics = async (): Promise<{ result: 'ok' | 'error' | 'skip' }> => {
		if (isNullish($orbiterStore)) {
			return { result: 'skip' };
		}

		if (isNullish($versionStore.orbiter) || isNullish($versionStore.orbiter?.current)) {
			return { result: 'skip' };
		}

		const { from, ...restPeriod } = $analyticsFiltersStore;

		if (isNullish(from)) {
			toasts.warn($i18n.analytics.warn_no_from);
			return { result: 'skip' };
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

			return { result: 'ok' };
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.analytics_load_error,
				detail: err
			});

			return { result: 'error' };
		}
	};

	const reloadAnalytics = async (): Promise<{ result: 'ok' | 'error' | 'skip' }> => {
		reloadingAnalytics = 'in_progress';

		const { result } = await loadAnalytics();

		if (result !== 'ok') {
			reloadingAnalytics = 'error';
			return { result };
		}

		reloadingAnalytics = 'loaded';
		toasts.success({ text: $i18n.analytics.analytics_updated, color: 'secondary' });

		setTimeout(() => {
			reloadingAnalytics = 'idle';
		}, 1500);

		return { result };
	};

	const init = async () => {
		if ($orbitersStore === undefined) {
			return;
		}

		if (isNullish($orbiterStore)) {
			loadingOrbiter = 'done';
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
			loadingOrbiter = 'error';
			return;
		}

		loadingOrbiter = 'done';

		await loadAnalytics();
	};

	const debounceInit = debounce(init);

	$effect(() => {
		$orbitersStore;
		$versionStore;

		debounceInit();
	});
</script>

{#if loadingOrbiter === 'in_progress'}
	<div class="loading">
		<SpinnerParagraph>{$i18n.analytics.loading}</SpinnerParagraph>
	</div>
{:else if loadingOrbiter !== 'error'}
	{#if isNullish($orbiterStore)}
		<NoAnalytics />

		<AnalyticsNew />
	{:else}
		<AnalyticsFilter loadAnalytics={reloadAnalytics} />

		{#if reloadingAnalytics === 'error'}
			<div in:fade><Warning>{$i18n.analytics.error_msg}</Warning></div>
		{:else if reloadingAnalytics === 'in_progress'}
			<div class="loading-data" in:fade>
				<SpinnerParagraph>{$i18n.analytics.loading}</SpinnerParagraph>
			</div>
		{/if}

		{#if nonNullish(pageViews)}
			<AnalyticsMetrics {pageViews} />

			<AnalyticsChart data={pageViews} />

			<AnalyticsPageViews {pageViews} />

			{#if nonNullish(performanceMetrics) && performanceMetrics.pages.length > 0}
				<hr />

				<AnalyticsPerformanceMetrics {performanceMetrics} />
			{/if}

			{#if nonNullish(trackEvents) && trackEvents.total.length > 0}
				<hr />

				<AnalyticsEvents {trackEvents} />

				<AnalyticsEventsExport orbiter={$orbiterStore} />
			{/if}
		{/if}
	{/if}
{/if}

<style lang="scss">
	.loading {
		margin: var(--padding-3x) 0 0;
	}

	.loading-data {
		margin: var(--padding-2x) 0 var(--padding-6x);
		--spinner-paragraph-margin: 0;
	}

	.loaded {
		display: inline-block;
		font-size: var(--font-size-small);
		padding: 0 0 var(--padding-2x);
	}
</style>
