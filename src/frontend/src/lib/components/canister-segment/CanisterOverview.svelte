<script lang="ts">
	import { fromNullishNullable } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import CanisterSyncData from '$lib/components/canister/CanisterSyncData.svelte';
	import CanisterOverview from '$lib/components/canister/display/CanisterOverview.svelte';
	import CanisterSubnet from '$lib/components/canister/display/CanisterSubnet.svelte';
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
	import { listCustomDomains } from '$lib/services/satellite/custom-domain.services';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';
	import type { Satellite, SatelliteIdText } from '$lib/types/satellite';
	import type { SegmentCanister } from '$lib/types/segment';

	interface Props {
		canister: SegmentCanister;
	}

	let { canister }: Props = $props();

	let monitoring = $derived(
		'settings' in canister
			? fromNullishNullable(fromNullishNullable(canister.settings)?.monitoring)
			: undefined
	);

	let monitoringEnabled = $derived(fromNullishNullable(monitoring?.cycles)?.enabled === true);

	let canisterId = $derived(canister.canisterId.toText());

	let canisterData = $state<CanisterSyncDataType | undefined>(undefined);

	// TODO: make component generic
	let satellite = $derived(canister as unknown as Satellite);
</script>

<CanisterSyncData canisterId={canister.canisterId} bind:canister={canisterData} />

<div class="card-container with-title">
	<span class="title">{$i18n.satellites.overview}</span>

	<div class="columns-3">
		<div>
			<SatelliteName {satellite} />

			<SatelliteEnvText {satellite} />

			<SatelliteTags {satellite} />
		</div>

		<div>
			<Value>
				{#snippet label()}
					{$i18n.canister.id}
				{/snippet}
				<Identifier
					identifier={canisterId}
					shorten={false}
					small={false}
					testId={testIds.satelliteOverview.copySatelliteId}
				/>
			</Value>

			<CanisterSubnet canisterId={canister.canisterId} />
		</div>
	</div>
</div>

<SatelliteOverviewActions {monitoringEnabled} {satellite} />

<div class="card-container with-title">
	<span class="title">{$i18n.monitoring.runtime}</span>

	<div class="columns-3">
		<CanisterOverview canisterId={canister.canisterId} segment="canister" />
	</div>
</div>

<SatelliteRuntimeActions canister={canisterData} {monitoringEnabled} {satellite} />

<style lang="scss">
	.card-container:last-of-type {
		margin: var(--padding-4x) 0 0;
	}
</style>
