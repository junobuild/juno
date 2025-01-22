<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import Canister from '$lib/components/canister/Canister.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import LaunchpadLink from '$lib/components/launchpad/LaunchpadLink.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutSatellites } from '$lib/stores/layout-launchpad.store';
	import { SatellitesLayout } from '$lib/types/layout';
	import { overviewLink } from '$lib/utils/nav.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let { satellite_id } = $derived(satellite);

	let name: string = $derived(satelliteName(satellite));

	let href: string = $derived(overviewLink(satellite.satellite_id));

	let row = $derived($layoutSatellites === SatellitesLayout.LIST);
</script>

<LaunchpadLink {href} ariaLabel={`${$i18n.core.open}: ${name}`} {row}>
	{#snippet summary()}
		<p>{name}</p>
		<IconSatellite size={row ? '28px' : '48px'} />
	{/snippet}

	<Canister canisterId={satellite_id} {row} />
</LaunchpadLink>

<style lang="scss">
	@use '../../styles/mixins/text';
	@use '../../styles/mixins/fonts';

	p {
		@include fonts.bold(true);

		@include text.truncate;
		margin: 0;
	}
</style>
