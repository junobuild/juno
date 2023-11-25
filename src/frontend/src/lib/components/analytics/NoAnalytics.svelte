<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import NoAnalyticsActions from '$lib/components/analytics/NoAnalyticsActions.svelte';
</script>

<div class="card-container">
	<p>{$i18n.analytics.empty}</p>

	<NoAnalyticsActions />
</div>

<style lang="scss">
	p {
		width: calc(100% - var(--padding-6x));
	}
</style>
