<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import Canister from '$lib/components/canister/Canister.svelte';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import SatelliteTopUp from '$lib/components/satellites/SatelliteTopUp.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { versionStore } from '$lib/stores/version.store';
	import { i18n } from '$lib/stores/i18n.store';

	export let satellite: Satellite;

	let satelliteId: string;
	$: satelliteId = satellite.satellite_id.toText();
</script>

<div class="card-container">
	<Value>
		<svelte:fragment slot="label">{$i18n.satellites.name}</svelte:fragment>
		<p>{satelliteName(satellite)}</p>
	</Value>

	<Value>
		<svelte:fragment slot="label">{$i18n.satellites.id}</svelte:fragment>
		<Identifier identifier={satelliteId} shorten={false} nomargin={false} />
	</Value>

	<Value>
		<svelte:fragment slot="label">{$i18n.core.version}</svelte:fragment>
		<p>v{$versionStore?.satellite?.current ?? '...'}</p>
	</Value>

	<Value>
		<svelte:fragment slot="label">{$i18n.core.status}</svelte:fragment>
		<Canister canisterId={satellite.satellite_id} />
	</Value>
</div>

<SatelliteTopUp {satellite} />

<style lang="scss">
	@use '../../styles/mixins/text';

	p {
		@include text.truncate;
	}
</style>
