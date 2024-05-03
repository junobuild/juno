<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import LinkCard from '$lib/components/ui/LinkCard.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import type { Principal } from '@dfinity/principal';
	import { overviewLink } from '$lib/utils/nav.utils';
	import Canister from '$lib/components/canister/Canister.svelte';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { i18n } from '$lib/stores/i18n.store';

	export let satellite: Satellite;

	let satellite_id: Principal;
	$: ({ satellite_id } = satellite);

	let name: string;
	$: name = satelliteName(satellite);

	let href: string;
	$: href = overviewLink(satellite.satellite_id);
</script>

<LinkCard {href} ariaLabel={`${$i18n.satellites.open}: ${name}`}>
	<svelte:fragment slot="summary">
		<h4>{name}</h4>
		<IconSatellite />
	</svelte:fragment>

	<Canister canisterId={satellite_id} segment="satellite" />
</LinkCard>

<style lang="scss">
	@use '../../styles/mixins/text';

	h4 {
		@include text.truncate;
		margin: 0;
	}
</style>
