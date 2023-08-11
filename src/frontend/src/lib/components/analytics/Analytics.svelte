<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { getPageViews } from '$lib/api/orbiter.api';
	import type { AnalyticKey, PageView } from '$declarations/orbiter/orbiter.did';
	import Value from '$lib/components/ui/Value.svelte';
	import AnalyticsChart from '$lib/components/analytics/AnalyticsChart.svelte';
	import { isNullish } from '$lib/utils/utils';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import AnalyticsNew from '$lib/components/analytics/AnalyticsNew.svelte';
	import AnalyticsFilter from '$lib/components/analytics/AnalyticsFilter.svelte';
	import type { PageViewsPeriod } from '$lib/types/ortbiter';
	import { debounce } from '$lib/utils/debounce.utils';

	let loading = true;

	let data: [AnalyticKey, PageView][] = [];

	let period: PageViewsPeriod = {};

	const loadPageViews = async () => {
		if (isNullish($orbiterStore)) {
			loading = false;
			return;
		}

		try {
			data = await getPageViews({
				satelliteId: $satelliteStore?.satellite_id,
				orbiterId: $orbiterStore.orbiter_id,
				...period
			});

			loading = false;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.analytics_load_error,
				detail: err
			});
		}
	};

	const debouncePageViews = debounce(loadPageViews);

	$: $orbiterStore, $satelliteStore, period, debouncePageViews();

	let uniqueSessions: number = 0;
	$: uniqueSessions = [...new Set(data.map(([key, _]) => key.session_id))].length;

	let sessionsViews: Record<string, number> = {};
	$: sessionsViews = data.reduce(
		(acc, [{ session_id }, _]) => ({
			...acc,
			[session_id]: (acc[session_id] ?? 0) + 1
		}),
		{}
	);

	let sessionsUniqueViews: Record<string, Set<string>> = {};
	$: sessionsUniqueViews = data.reduce(
		(acc, [{ session_id }, { href }]) => ({
			...acc,
			[session_id]: (acc[session_id] ?? new Set()).add(href)
		}),
		{}
	);

	let uniquePageViews = 0;
	$: uniquePageViews = Object.entries(sessionsViews).reduce((acc, value) => acc + value.length, 0);

	let bounceRate = 0;
	$: bounceRate = Object.entries(sessionsViews).filter(([key, value]) => value === 1).length;

	const selectPeriod = ({ detail }: CustomEvent<PageViewsPeriod>) => (period = detail);
</script>

<div class="card-container">
	{#if loading}
		<SpinnerParagraph>{$i18n.analytics.loading}</SpinnerParagraph>
	{:else if isNullish($orbiterStore)}
		<AnalyticsNew />
	{:else}
		<AnalyticsFilter on:junoPeriod={selectPeriod} />

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
			<p>{data.length}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label"
				>{$i18n.analytics.average_page_views_per_session}</svelte:fragment
			>
			<p>{uniqueSessions > 0 ? uniqueSessions / data.length : 0}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">{$i18n.analytics.bounce_rate}</svelte:fragment>
			<p>{bounceRate}</p>
		</Value>

		{#if data.length > 0}
			<AnalyticsChart {data} />
		{/if}
	{/if}
</div>
