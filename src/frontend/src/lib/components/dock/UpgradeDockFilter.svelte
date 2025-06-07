<script lang="ts">
	import AnalyticsSatellitesPicker from '$lib/components/analytics/AnalyticsSatellitesPicker.svelte';
	import Toolbar from '$lib/components/ui/Toolbar.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { satellitesStore } from '$lib/derived/satellites.derived';
	import type { SatellitePickerProps } from '$lib/components/satellites/SatellitesPicker.svelte';
	import { satelliteName } from '$lib/utils/satellite.utils';

	let satellites = $derived<SatellitePickerProps['satellites']>(
		Object.entries($satellitesStore ?? []).reduce<SatellitePickerProps['satellites']>(
			(acc, [satelliteId, satellite]) => [
				...acc,
				{
					satelliteId,
					satName: satelliteName(satellite)
				}
			],
			[]
		)
	);
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
