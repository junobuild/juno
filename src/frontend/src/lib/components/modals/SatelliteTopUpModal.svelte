<script lang="ts">
	import type { JunoModalSatelliteDetail } from '$lib/types/modal';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CanisterTopUpModal from '$lib/components/modals/CanisterTopUpModal.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import { satelliteName } from '$lib/utils/satellite.utils';

	export let detail: JunoModalSatelliteDetail;

	let satellite: Satellite;
	$: ({ satellite } = detail);
</script>

<CanisterTopUpModal canisterId={satellite.satellite_id} on:junoClose>
	<svelte:fragment slot="intro">
		<h2>Top-up {satelliteName(satellite)}</h2>

		<p>
			{@html i18nFormat($i18n.canisters.cycles, [
				{
					placeholder: '{0}',
					value:
						'<a href="https://internetcomputer.org/docs/current/concepts/tokens-cycles/" rel="external noopener norefferer">Cycles</a>'
				}
			])}
		</p>

		<p>TODO: Link to help</p>

		<p>
			Unlike with web2 cloud providers, you do not get a monthly bill after the resources have been
			consumed but, you have to make sure there is always enough cycles to cover the costs of
			operations of your satellite.
		</p>

		<p>It is on our roadmap to make topping-up automatic when needed.</p>
	</svelte:fragment>

	<svelte:fragment slot="outro">
		<IconSatellite />
		<p>Your satellite has been topped-up.</p>
	</svelte:fragment>
</CanisterTopUpModal>
