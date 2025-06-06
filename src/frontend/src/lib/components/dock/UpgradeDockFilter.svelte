<script lang="ts">
	import AnalyticsSatellitesPicker from '$lib/components/analytics/AnalyticsSatellitesPicker.svelte';
	import Toolbar from '$lib/components/ui/Toolbar.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<Toolbar>
	{#snippet start()}
		<Value>
			{#snippet label()}
				{$i18n.analytics.satellites}
			{/snippet}
			<AnalyticsSatellitesPicker />
		</Value>
	{/snippet}
</Toolbar>
