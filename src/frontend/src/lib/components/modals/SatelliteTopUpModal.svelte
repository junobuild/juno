<script lang="ts">
	import type { JunoModalTopUpSatelliteDetail, JunoModalDetail } from '$lib/types/modal';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CanisterTopUpModal from '$lib/components/modals/CanisterTopUpModal.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import type { JunoModalCreateSatelliteDetail } from '$lib/types/modal';

	export let detail: JunoModalDetail;

	let satellite: Satellite;
	let balance = 0n;

	$: ({ satellite } = detail as JunoModalTopUpSatelliteDetail);
	$: balance = (detail as JunoModalCreateSatelliteDetail).missionControlBalance?.balance ?? 0n;
</script>

<CanisterTopUpModal canisterId={satellite.satellite_id} {balance} on:junoClose>
	<svelte:fragment slot="intro">
		<h2>
			{@html i18nFormat($i18n.canisters.top_up_title, [
				{
					placeholder: '{0}',
					value: satelliteName(satellite)
				}
			])}
		</h2>
	</svelte:fragment>

	<svelte:fragment slot="outro">
		<IconSatellite />
		<p>Your satellite has been topped-up.</p>
	</svelte:fragment>
</CanisterTopUpModal>
