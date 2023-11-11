<script lang="ts">
	import type { AnalyticKey, PageView } from '$declarations/orbiter/orbiter.did';
	import AnalyticsPages from '$lib/components/analytics/AnalyticsPages.svelte';
	import AnalyticsReferrers from '$lib/components/analytics/AnalyticsReferrers.svelte';

	export let pageViews: [AnalyticKey, PageView][] = [];
</script>

{#if pageViews.length > 0}
	<div class="container">
		<AnalyticsReferrers {pageViews} />

		<AnalyticsPages {pageViews} />
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
