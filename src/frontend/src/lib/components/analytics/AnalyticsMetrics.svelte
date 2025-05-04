<script lang="ts">
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';
	import { formatCompactNumber, formatNumber } from '$lib/utils/number.utils';
	import type {Snippet} from "svelte";

	interface Props {
		pageViews: AnalyticsPageViews;
		charts: Snippet;
	}

	let { pageViews, charts }: Props = $props();

	let { metrics } = $derived(pageViews);
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.analytics.visitors}</span>

	<div class="content">
		<div class="cell">
			<Value>
				{#snippet label()}
					{$i18n.analytics.number_of_sessions}
				{/snippet}
				<p>{formatCompactNumber(Number(metrics.unique_sessions ?? 0n))}</p>
			</Value>
		</div>

		<div class="cell">
			<Value>
				{#snippet label()}
					{$i18n.analytics.unique_page_views}
				{/snippet}
				<p>{formatCompactNumber(Number(metrics.unique_page_views ?? 0n))}</p>
			</Value>
		</div>

		<div class="cell">
			<Value>
				{#snippet label()}
					{$i18n.analytics.total_page_views}
				{/snippet}
				<p>{formatCompactNumber(metrics.total_page_views ?? 0n)}</p>
			</Value>
		</div>

		<div class="cell">
			<Value>
				{#snippet label()}
					{$i18n.analytics.average_page_views_per_session}
				{/snippet}
				<p>{formatNumber(metrics.average_page_views_per_session)}</p>
			</Value>
		</div>

		<div class="cell">
			<Value>
				{#snippet label()}
					{$i18n.analytics.bounce_rate}
				{/snippet}
				<p>
					{formatNumber(metrics.bounce_rate * 100, { minFraction: 0, maxFraction: 0 })}<small
						>%</small
					>
				</p>
			</Value>
		</div>
	</div>

	{@render charts()}
</div>

<style lang="scss">
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/grid';

	.content {
		@include media.min-width(medium) {
			@include grid.two-columns;
		}

		@include media.min-width(large) {
			@include grid.three-columns;
		}
	}

	.cell {
		@include media.min-width(large) {
			display: inline-flex;
			gap: var(--padding);
			height: var(--padding-4x);
		}
	}
</style>
