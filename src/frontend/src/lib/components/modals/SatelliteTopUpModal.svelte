<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import CanisterTopUpModal from '$lib/components/modals/CanisterTopUpModal.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalTopUpSatelliteDetail, JunoModalDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	export let detail: JunoModalDetail;

	let satellite: Satellite;
	let balance = 0n;
	let accountIdentifier: AccountIdentifier | undefined;

	$: ({ satellite } = detail as JunoModalTopUpSatelliteDetail);
	$: balance = (detail as JunoModalTopUpSatelliteDetail).missionControlBalance?.balance ?? 0n;
	$: accountIdentifier = (detail as JunoModalTopUpSatelliteDetail).missionControlBalance
		?.accountIdentifier;
</script>

<CanisterTopUpModal canisterId={satellite.satellite_id} {balance} {accountIdentifier} on:junoClose>
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
		<p>{$i18n.canisters.top_up_satellite_done}</p>
	</svelte:fragment>
</CanisterTopUpModal>
