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
	import CanisterJunoStatuses from '$lib/components/canister/CanisterJunoStatuses.svelte';
	import SatelliteOverviewCustomDomain from '$lib/components/satellites/SatelliteOverviewCustomDomain.svelte';

	export let satellite: Satellite;

	let satelliteId: SatelliteIdText;
	$: satelliteId = satellite.satellite_id.toText();
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.satellites.overview}</span>

	<div class="columns-3 fit-column-1">
		<div>
			<SatelliteName {satellite} />

			<Value>
				<svelte:fragment slot="label">{$i18n.satellites.id}</svelte:fragment>
				<Identifier identifier={satelliteId} shorten={false} small={false} />
			</Value>

			<SatelliteOverviewCustomDomain {satellite} />
		</div>

		<div>
			<SatelliteOverviewVersion {satelliteId} />
		</div>
	</div>

	<SatelliteActions {satellite} />
</div>

<div class="card-container with-title">
	<span class="title">{$i18n.canisters.insight}</span>

	<div class="columns-3">
		<CanisterOverview
			canisterId={satellite.satellite_id}
			segment="satellite"
			heapWarningLabel={$i18n.canisters.warning_satellite_heap_memory}
		/>

		<CanisterJunoStatuses segment="satellite" canisterId={satellite.satellite_id} />
	</div>
</div>

<style lang="scss">
	.card-container:last-of-type {
		margin: var(--padding-4x) 0 0;
	}
</style>
