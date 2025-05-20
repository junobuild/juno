<script lang="ts">
	import AnalyticsBrowsers from '$lib/components/analytics/AnalyticsBrowsers.svelte';
	import AnalyticsDevices from '$lib/components/analytics/AnalyticsDevices.svelte';
	import AnalyticsOS from '$lib/components/analytics/AnalyticsOS.svelte';
	import AnalyticsPages from '$lib/components/analytics/AnalyticsPages.svelte';
	import AnalyticsReferrers from '$lib/components/analytics/AnalyticsReferrers.svelte';
	import AnalyticsTimeZones from '$lib/components/analytics/AnalyticsTimeZones.svelte';
	import AnalyticsUtmCampaigns from '$lib/components/analytics/AnalyticsUtmCampaigns.svelte';
	import AnalyticsUtmSources from '$lib/components/analytics/AnalyticsUtmSources.svelte';
	import type { AnalyticsPageViews } from '$lib/types/orbiter';

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

		<AnalyticsUtmSources {pageViews} />

		<AnalyticsUtmCampaigns {pageViews} />

		<AnalyticsTimeZones {pageViews} />

		<AnalyticsDevices {pageViews} />

		<AnalyticsBrowsers {pageViews} />

		<AnalyticsOS {pageViews} />
	</div>
{/if}


<style lang="scss">
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/grid';

	.container {
		margin: var(--padding-4x) 0 var(--padding);

		@include media.min-width(medium) {
			@include grid.two-columns;
		}

		@include media.min-width(large) {
			@include grid.three-columns;
		}
	}
</style>
