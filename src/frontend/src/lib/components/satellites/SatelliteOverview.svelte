<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import Canister from '$lib/components/canister/Canister.svelte';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import SatelliteTopUp from '$lib/components/satellites/SatelliteTopUp.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { versionStore } from '$lib/stores/version.store';

	export let satellite: Satellite;

	let satelliteId: string;
	$: satelliteId = satellite.satellite_id.toText();
</script>

<div class="card-container">
	<h1>{satelliteName(satellite)}</h1>

	<Value>
		<svelte:fragment slot="label">ID</svelte:fragment>
		<Identifier identifier={satelliteId} shorten={false} nomargin={false} />
	</Value>

	<Value>
		<svelte:fragment slot="label">Version</svelte:fragment>
		<p>v{$versionStore?.satellite?.current ?? '...'}</p>
	</Value>

	<Value>
		<svelte:fragment slot="label">Status</svelte:fragment>
		<Canister canisterId={satellite.satellite_id} />
	</Value>
</div>

<SatelliteTopUp {satellite} />

<style lang="scss">
	@use '../../styles/mixins/text';

	h1 {
		margin: 0 0 var(--padding-3x);
	}

	p,
	h1 {
		@include text.truncate;
	}
</style>
