<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import SatelliteActions from '$lib/components/satellites/SatelliteActions.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import SatelliteName from '$lib/components/satellites/SatelliteName.svelte';
	import SatelliteOverviewVersion from '$lib/components/satellites/SatelliteOverviewVersion.svelte';
	import SatelliteStatuses from '$lib/components/satellites/SatelliteStatuses.svelte';

	export let satellite: Satellite;

	let satelliteId: SatelliteIdText;
	$: satelliteId = satellite.satellite_id.toText();
</script>

<div class="card-container columns-3 fit-column-1">
	<div>
		<SatelliteName {satellite} />

		<Value>
			<svelte:fragment slot="label">{$i18n.satellites.id}</svelte:fragment>
			<Identifier identifier={satelliteId} shorten={false} small={false} />
		</Value>
	</div>

	<div>
		<SatelliteOverviewVersion {satelliteId} />
	</div>

	<SatelliteActions {satellite} />
</div>

<div class="card-container columns-3">
	<div>
		<CanisterOverview
			canisterId={satellite.satellite_id}
			segment="satellite"
			heapWarningLabel={$i18n.canisters.warning_satellite_heap_memory}
		/>
	</div>

	<SatelliteStatuses {satellite} />
</div>

<style lang="scss">
	.card-container:last-of-type {
		margin: var(--padding-4x) 0 0;
	}
</style>
