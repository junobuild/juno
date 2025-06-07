<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import SatellitesPicker, {
		type SatellitePickerProps
	} from '$lib/components/satellites/SatellitesPicker.svelte';
	import Toolbar from '$lib/components/ui/Toolbar.svelte';
	import { satellitesStore } from '$lib/derived/satellites.derived';
	import { navigateToUpgradeDock } from '$lib/utils/nav.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	const navigate = async (satelliteId: Principal | undefined) =>
		await navigateToUpgradeDock(satelliteId);

	let satellites = $derived(
		($satellitesStore ?? []).reduce<SatellitePickerProps['satellites']>(
			(acc, satellite) => [
				...acc,
				{
					satelliteId: satellite.satellite_id.toText(),
					satName: satelliteName(satellite)
				}
			],
			[]
		)
	);
</script>

<Toolbar>
	{#snippet start()}
		<SatellitesPicker {satellites} {navigate} />
	{/snippet}
</Toolbar>
