<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import CanisterTopUpModal from '$lib/components/modals/CanisterTopUpModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalTopUpSatelliteDetail, JunoModalDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { satellite } = $derived(detail as JunoModalTopUpSatelliteDetail);
	let balance = $derived(
		(detail as JunoModalTopUpSatelliteDetail).missionControlBalance?.balance ?? 0n
	);
	let accountIdentifier: AccountIdentifier | undefined = $derived(
		(detail as JunoModalTopUpSatelliteDetail).missionControlBalance?.accountIdentifier
	);
</script>

<CanisterTopUpModal
	segment="satellite"
	canisterId={satellite.satellite_id}
	{balance}
	{accountIdentifier}
	{onclose}
>
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
