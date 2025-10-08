<script lang="ts">
	import { fromNullishNullable } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import CanisterSubnet from '$lib/components/canister/CanisterSubnet.svelte';
	import CanisterSyncData from '$lib/components/canister/CanisterSyncData.svelte';
	import SatelliteEnvText from '$lib/components/satellites/SatelliteEnvironmentText.svelte';
	import SatelliteName from '$lib/components/satellites/SatelliteName.svelte';
	import SatelliteOverviewActions from '$lib/components/satellites/SatelliteOverviewActions.svelte';
	import SatelliteOverviewCustomDomains from '$lib/components/satellites/SatelliteOverviewCustomDomains.svelte';
	import SatelliteOverviewVersion from '$lib/components/satellites/SatelliteOverviewVersion.svelte';
	import SatelliteRuntimeActions from '$lib/components/satellites/SatelliteRuntimeActions.svelte';
	import SatelliteTags from '$lib/components/satellites/SatelliteTags.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { listCustomDomains } from '$lib/services/custom-domain.services';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';
	import type { MissionControlDid } from '$lib/types/declarations';
	import type { SatelliteIdText } from '$lib/types/satellite';

	interface Props {
		satellite: MissionControlDid.Satellite;
	}

	let { satellite }: Props = $props();

	let monitoring = $derived(
		fromNullishNullable(fromNullishNullable(satellite.settings)?.monitoring)
	);

	let monitoringEnabled = $derived(fromNullishNullable(monitoring?.cycles)?.enabled === true);

	let satelliteId: SatelliteIdText = $derived(satellite.satellite_id.toText());

	let canister = $state<CanisterSyncDataType | undefined>(undefined);

	onMount(async () => {
		await listCustomDomains({
			satelliteId: satellite.satellite_id,
			reload: false
		});
	});
</script>

<CanisterSyncData canisterId={satellite.satellite_id} bind:canister />

<div class="card-container with-title">
	<span class="title">{$i18n.satellites.overview}</span>

	<div class="columns-3">
		<div>
			<SatelliteName {satellite} />

			<SatelliteEnvText {satellite} />

			<SatelliteTags {satellite} />

			<SatelliteOverviewCustomDomains {satellite} />
		</div>

		<div>
			<Value>
				{#snippet label()}
					{$i18n.satellites.id}
				{/snippet}
				<Identifier
					identifier={satelliteId}
					shorten={false}
					small={false}
					testId={testIds.satelliteOverview.copySatelliteId}
				/>
			</Value>

			<CanisterSubnet canisterId={satellite.satellite_id} />
		</div>

		<div>
			<SatelliteOverviewVersion {satelliteId} />
		</div>
	</div>
</div>

<SatelliteOverviewActions {monitoringEnabled} {satellite} />

<div class="card-container with-title">
	<span class="title">{$i18n.monitoring.runtime}</span>

	<div class="columns-3">
		<CanisterOverview
			canisterId={satellite.satellite_id}
			heapWarningLabel={$i18n.canisters.warning_satellite_heap_memory}
			segment="satellite"
		/>
	</div>
</div>

<SatelliteRuntimeActions {canister} {monitoringEnabled} {satellite} />

<style lang="scss">
	.card-container:last-of-type {
		margin: var(--padding-4x) 0 0;
	}
</style>
