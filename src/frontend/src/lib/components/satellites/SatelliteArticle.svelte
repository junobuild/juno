<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import LaunchpadLink from '$lib/components/launchpad/LaunchpadLink.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import type { Principal } from '@dfinity/principal';
	import { overviewLink } from '$lib/utils/nav.utils';
	import Canister from '$lib/components/canister/Canister.svelte';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutSatellites } from '$lib/stores/layout.store';
	import { SatellitesLayout } from '$lib/types/layout';

	export let satellite: Satellite;

	let satellite_id: Principal;
	$: ({ satellite_id } = satellite);

	let name: string;
	$: name = satelliteName(satellite);

	let href: string;
	$: href = overviewLink(satellite.satellite_id);

	let row = false;
	$: row = $layoutSatellites === SatellitesLayout.LIST;
</script>

<LaunchpadLink {href} ariaLabel={`${$i18n.satellites.open}: ${name}`} {row}>
	<svelte:fragment slot="summary">
		<h4>{name}</h4>
		<IconSatellite size={row ? '28px' : '48px'} />
	</svelte:fragment>

	<Canister canisterId={satellite_id} segment="satellite" {row} />
</LaunchpadLink>

<style lang="scss">
	@use '../../styles/mixins/text';

	h4 {
		@include text.truncate;
		margin: 0;
	}
</style>
