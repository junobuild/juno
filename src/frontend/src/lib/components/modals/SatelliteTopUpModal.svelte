<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { run } from 'svelte/legacy';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import CanisterTopUpModal from '$lib/components/modals/CanisterTopUpModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalTopUpSatelliteDetail, JunoModalDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		detail: JunoModalDetail;
	}

	let { detail }: Props = $props();

	let { satellite } = $derived(detail as JunoModalTopUpSatelliteDetail);
	let balance = $derived(
		(detail as JunoModalTopUpSatelliteDetail).missionControlBalance?.balance ?? 0n
	);
	let accountIdentifier: AccountIdentifier | undefined = $derived(
		(detail as JunoModalTopUpSatelliteDetail).missionControlBalance?.accountIdentifier
	);
</script>

<CanisterTopUpModal canisterId={satellite.satellite_id} {balance} {accountIdentifier} on:junoClose>
	{#snippet intro()}
		<h2>
			<Html
				text={i18nFormat($i18n.canisters.top_up_title, [
					{
						placeholder: '{0}',
						value: satelliteName(satellite)
					}
				])}
			/>
		</h2>
	{/snippet}

	{#snippet outro()}
		<IconSatellite />
		<p>{$i18n.canisters.top_up_satellite_done}</p>
	{/snippet}
</CanisterTopUpModal>
