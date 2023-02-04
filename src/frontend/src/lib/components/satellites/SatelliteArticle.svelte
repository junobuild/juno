<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import Article from '$lib/components/ui/Article.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import type { Principal } from '@dfinity/principal';
	import { navigateToSatellite } from '$lib/utils/nav.utils';
	import Canister from '$lib/components/canister/Canister.svelte';
	import { satelliteName } from '$lib/utils/satellite.utils';

	export let satellite: Satellite;

	let satellite_id: Principal;
	$: ({ satellite_id } = satellite);

	let name: string;
	$: name = satelliteName(satellite);
</script>

<Article on:click={async () => await navigateToSatellite(satellite.satellite_id)}>
	<svelte:fragment slot="summary">
		<h2>{name}</h2>
		<IconSatellite />
	</svelte:fragment>

	<Canister canisterId={satellite_id} />
</Article>

<style lang="scss">
	@use '../../styles/mixins/text';

	h2 {
		@include text.truncate;
	}
</style>
