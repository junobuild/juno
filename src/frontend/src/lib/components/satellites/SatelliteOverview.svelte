<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import SatelliteTopUp from '$lib/components/satellites/SatelliteTopUp.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { versionStore } from '$lib/stores/version.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { SatelliteIdText } from '$lib/types/satellite';

	export let satellite: Satellite;

	let satelliteId: SatelliteIdText;
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
		<p>v{$versionStore?.satellites[satelliteId]?.current ?? '...'}</p>
	</Value>

	<CanisterOverview canisterId={satellite.satellite_id} />
</div>

<SatelliteTopUp {satellite} />

<style lang="scss">
	@use '../../styles/mixins/text';

	p {
		@include text.truncate;
	}
</style>
