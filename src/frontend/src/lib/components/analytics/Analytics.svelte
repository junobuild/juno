<script lang="ts">
	import { Principal } from '@dfinity/principal';
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { getPageViews } from '$lib/api/orbiter.api';
	import { onMount } from 'svelte';
	import type { AnalyticKey, PageView } from '$declarations/orbiter/orbiter.did';
	import Value from '$lib/components/ui/Value.svelte';
	import AnalyticsChart from '$lib/components/analytics/AnalyticsChart.svelte';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { isNullish } from '$lib/utils/utils';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import { satellitesStore } from '$lib/stores/satellite.store';

	let loading = true;

	let data: [AnalyticKey, PageView][] = [];

	const loadPageViews = async () => {
		if (isNullish($orbiterStore)) {
			loading = false;
			return;
		}

		// TODO all satellites
		if (isNullish($satellitesStore)) {
			loading = false;
			return;
		}

		try {
			data = await getPageViews({
				satelliteId: $satellitesStore[0].satellite_id,
				orbiterId: $orbiterStore.orbiter_id
			});

			loading = false;
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.analytics_load_error,
				detail: err
			});
		}
	};

	onMount(async () => {
		await loadOrbiters({ missionControl: $missionControlStore });
		await loadPageViews();
	});

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
</script>

<div class="card-container">
	{#if loading}
		<SpinnerParagraph>{$i18n.analytics.loading}</SpinnerParagraph>
	{:else if isNullish($orbiterStore)}
		Empty
	{:else}
		<Value>
			<svelte:fragment slot="label">Number of Sessions</svelte:fragment>
			<p>{uniqueSessions}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">Unique page views</svelte:fragment>
			<p>{uniquePageViews}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">Total page views</svelte:fragment>
			<p>{data.length}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">Average page views per session</svelte:fragment>
			<p>{uniqueSessions / data.length}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">Bounce rate</svelte:fragment>
			<p>{bounceRate}</p>
		</Value>

		<AnalyticsChart {data} />
	{/if}
</div>
