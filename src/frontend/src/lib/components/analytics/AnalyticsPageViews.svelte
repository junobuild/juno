<script lang="ts">
	import AnalyticsBrowsers from '$lib/components/analytics/AnalyticsBrowsers.svelte';
	import AnalyticsDevices from '$lib/components/analytics/AnalyticsDevices.svelte';
	import AnalyticsPages from '$lib/components/analytics/AnalyticsPages.svelte';
	import AnalyticsReferrers from '$lib/components/analytics/AnalyticsReferrers.svelte';
	import type { AnalyticsPageViews } from '$lib/types/ortbiter';

	interface Props {
		pageViews: AnalyticsPageViews;
	}

	let { pageViews }: Props = $props();
</script>

{#if pageViews.metrics.total_page_views > 0}
	<hr />

	<div class="container">
		<AnalyticsReferrers {pageViews} />

		<AnalyticsPages {pageViews} />

		<AnalyticsDevices {pageViews} />

		<AnalyticsBrowsers {pageViews} />
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/media';

	.container {
		margin: var(--padding-4x) 0;

		@include media.min-width(large) {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: var(--padding-4x);
		}
	}
</style>
