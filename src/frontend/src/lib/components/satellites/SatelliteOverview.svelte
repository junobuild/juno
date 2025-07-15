<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import CanisterSubnet from '$lib/components/canister/CanisterSubnet.svelte';
	import SatelliteOverviewActions from '$lib/components/satellites/SatelliteOverviewActions.svelte';
	import SatelliteName from '$lib/components/satellites/SatelliteName.svelte';
	import SatelliteOverviewCustomDomain from '$lib/components/satellites/SatelliteOverviewCustomDomain.svelte';
	import SatelliteOverviewVersion from '$lib/components/satellites/SatelliteOverviewVersion.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import CanisterSyncData from "$lib/components/canister/CanisterSyncData.svelte";
	import type {CanisterSyncData as CanisterSyncDataType} from "$lib/types/canister";
	import SatelliteMonitoringActions from "$lib/components/satellites/SatelliteMonitoringActions.svelte";

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let satelliteId: SatelliteIdText = $derived(satellite.satellite_id.toText());

	let canister = $state<CanisterSyncDataType | undefined>(undefined);
</script>

<CanisterSyncData canisterId={satellite.satellite_id} bind:canister />

<div class="card-container with-title">
	<span class="title">{$i18n.satellites.overview}</span>

	<div class="columns-3">
		<div>
			<SatelliteName {satellite} />

			<SatelliteOverviewCustomDomain {satellite} />
		</div>

		<div>
			<Value>
				{#snippet label()}
					{$i18n.satellites.id}
				{/snippet}
				<Identifier identifier={satelliteId} shorten={false} small={false} />
			</Value>

			<CanisterSubnet canisterId={satellite.satellite_id} />
		</div>

		<div>
			<SatelliteOverviewVersion {satelliteId} />
		</div>
	</div>
</div>

<SatelliteOverviewActions {satellite} {canister} />

<div class="card-container with-title">
	<span class="title">{$i18n.monitoring.title}</span>

	<div class="columns-3">
		<CanisterOverview
			canisterId={satellite.satellite_id}
			segment="satellite"
			heapWarningLabel={$i18n.canisters.warning_satellite_heap_memory}
		/>
	</div>
</div>

<SatelliteMonitoringActions {satellite} {canister} />

<style lang="scss">
	.card-container:last-of-type {
		margin: var(--padding-4x) 0 0;
	}
</style>
