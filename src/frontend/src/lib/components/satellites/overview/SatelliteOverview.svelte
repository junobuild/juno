<script lang="ts">
	import { fromNullishNullable } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import CanisterSyncData from '$lib/components/modules/canister/CanisterSyncData.svelte';
	import CanisterOverview from '$lib/components/modules/canister/display/CanisterOverview.svelte';
	import CanisterSubnet from '$lib/components/modules/canister/display/CanisterSubnet.svelte';
	import SatelliteEnvText from '$lib/components/satellites/SatelliteEnvironmentText.svelte';
	import SatelliteName from '$lib/components/satellites/overview/SatelliteName.svelte';
	import SatelliteOverviewActions from '$lib/components/satellites/overview/SatelliteOverviewActions.svelte';
	import SatelliteOverviewCustomDomains from '$lib/components/satellites/overview/SatelliteOverviewCustomDomains.svelte';
	import SatelliteOverviewVersion from '$lib/components/satellites/overview/SatelliteOverviewVersion.svelte';
	import SatelliteRuntimeActions from '$lib/components/satellites/overview/SatelliteRuntimeActions.svelte';
	import SatelliteTags from '$lib/components/satellites/overview/SatelliteTags.svelte';
	import SatelliteLastDeployments from '$lib/components/satellites/overview/deployments/SatelliteLastDeployments.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { isNotSkylab } from '$lib/env/app.env';
	import { listCustomDomains } from '$lib/services/satellite/hosting/custom-domain.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';
	import type { Satellite, SatelliteIdText } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let monitoring = $derived(
		'settings' in satellite
			? fromNullishNullable(fromNullishNullable(satellite.settings)?.monitoring)
			: undefined
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

<div class="overview">
	<div class="card-container with-title">
		<span class="title">{$i18n.satellites.overview}</span>

		<div class="columns-2">
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

				<SatelliteOverviewVersion {satelliteId} />
			</div>
		</div>
	</div>

	<div class="actions">
		<SatelliteOverviewActions {monitoringEnabled} {satellite} />
	</div>

	{#if isNotSkylab()}
		<div class="card-container with-title workflows">
			<span class="title">{$i18n.automation.last_deployments}</span>

			<div class="content">
				<SatelliteLastDeployments {satellite} />
			</div>
		</div>
	{/if}
</div>

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
	@use '../../../styles/mixins/media';

	.overview {
		display: grid;
		column-gap: var(--padding-4x);

		@include media.min-width(medium) {
			grid-template-columns: auto 1fr;
		}

		@include media.min-width(large) {
			grid-template-columns: auto minmax(200px, 300px);
		}
	}

	.actions {
		grid-row: 2 / 3;
	}

	.workflows {
		grid-row: 4 / 5;

		margin: 0 0 var(--padding-8x);

		@include media.min-width(xlarge) {
			grid-row: unset;

			margin: 0 0 var(--padding-3x);
		}
	}
</style>
