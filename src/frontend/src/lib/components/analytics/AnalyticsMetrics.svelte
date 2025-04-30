<script lang="ts">
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';
	import { formatNumber } from '$lib/utils/number.utils';

	interface Props {
		pageViews: AnalyticsPageViews;
	}

	let { pageViews }: Props = $props();

	let { metrics } = $derived(pageViews);
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.analytics.visitors}</span>

	<div class="content">
		<Value>
			{#snippet label()}
				{$i18n.analytics.number_of_sessions}
			{/snippet}
			<p>{metrics.unique_sessions}</p>
		</Value>

		<Value>
			{#snippet label()}
				{$i18n.analytics.unique_page_views}
			{/snippet}
			<p>{metrics.unique_page_views}</p>
		</Value>

		<Value>
			{#snippet label()}
				{$i18n.analytics.total_page_views}
			{/snippet}
			<p>{metrics.total_page_views}</p>
		</Value>

		<Value>
			{#snippet label()}
				{$i18n.analytics.average_page_views_per_session}
			{/snippet}
			<p>{formatNumber(metrics.average_page_views_per_session)}</p>
		</Value>

		<Value>
			{#snippet label()}
				{$i18n.analytics.bounce_rate}
			{/snippet}
			<p>
				{formatNumber(metrics.bounce_rate * 100, { minFraction: 0, maxFraction: 0 })}<small>%</small
				>
			</p>
		</Value>
	</div>
</div>
