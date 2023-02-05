<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import Canister from '$lib/components/canister/Canister.svelte';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import IconLaunch from '$lib/components/icons/IconLaunch.svelte';
	import { satelliteName, satelliteUrl } from '$lib/utils/satellite.utils';
	import SatelliteTopUp from '$lib/components/satellites/SatelliteTopUp.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	export let satellite: Satellite;

	let satelliteId: string;
	$: satelliteId = satellite.satellite_id.toText();
</script>

<div class="card-container">
	<div class="title">
		<h1>{satelliteName(satellite)}</h1>
		<ExternalLink href={satelliteUrl(satelliteId)} ariaLabel={$i18n.satellites.open}>
			<IconLaunch /></ExternalLink
		>
	</div>

	<Value>
		<svelte:fragment slot="label">ID</svelte:fragment>
		<p>{satelliteId}</p>
	</Value>

	<Value>
		<svelte:fragment slot="label">Status</svelte:fragment>
		<Canister canisterId={satellite.satellite_id} />
	</Value>
</div>

<SatelliteTopUp {satellite} />

<style lang="scss">
	@use '../../styles/mixins/text';

	.title {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		width: 100%;
		margin: 0 0 var(--padding-1_5x);
	}

	p,
	h1 {
		@include text.truncate;
	}
</style>
