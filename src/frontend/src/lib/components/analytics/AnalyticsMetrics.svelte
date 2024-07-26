<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { formatNumber } from '$lib/utils/number.utils';
	import Value from '$lib/components/ui/Value.svelte';
	import type { AnalyticsMetrics, AnalyticsPageViews } from '$lib/types/ortbiter';

	export let pageViews: AnalyticsPageViews;

	let metrics: AnalyticsMetrics;
	$: ({ metrics } = pageViews);
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.analytics.visitors}</span>

	<div class="content">
		<Value>
			<svelte:fragment slot="label">{$i18n.analytics.number_of_sessions}</svelte:fragment>
			<p>{metrics.unique_sessions}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">{$i18n.analytics.unique_page_views}</svelte:fragment>
			<p>{metrics.unique_page_views}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">{$i18n.analytics.total_page_views}</svelte:fragment>
			<p>{metrics.total_page_views}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label"
				>{$i18n.analytics.average_page_views_per_session}</svelte:fragment
			>
			<p>{formatNumber(metrics.average_page_views_per_session)}</p>
		</Value>

		<Value>
			<svelte:fragment slot="label">{$i18n.analytics.bounce_rate}</svelte:fragment>
			<p>
				{formatNumber(metrics.bounce_rate * 100, { minFraction: 0, maxFraction: 0 })}<small>%</small
				>
			</p>
		</Value>
	</div>
</div>
