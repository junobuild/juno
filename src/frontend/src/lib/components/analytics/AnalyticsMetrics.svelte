<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { formatNumber } from '$lib/utils/number.utils';
	import Value from '$lib/components/ui/Value.svelte';
	import type { AnalyticKey, PageView } from '$declarations/orbiter/orbiter.did';

	export let pageViews: [AnalyticKey, PageView][] = [];

	let uniqueSessions = 0;
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
</script>

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
		<svelte:fragment slot="label">{$i18n.analytics.average_page_views_per_session}</svelte:fragment>
		<p>{formatNumber(uniqueSessions > 0 ? uniqueSessions / pageViews.length : 0)}</p>
	</Value>

	<Value>
		<svelte:fragment slot="label">{$i18n.analytics.bounce_rate}</svelte:fragment>
		<p>{bounceRate}</p>
	</Value>
</div>
