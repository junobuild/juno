<script lang="ts">
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import CanisterTopUpModal from '$lib/components/modals/cycles/top-up/CanisterTopUpModal.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { JunoModalTopUpSatelliteDetail, JunoModalDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { metadataUiName } from '$lib/utils/metadata-ui.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { satellite } = $derived(detail as JunoModalTopUpSatelliteDetail);
</script>

<CanisterTopUpModal
	{onclose}
	segment={{
		segment: 'satellite',
		canisterId: satellite.satellite_id.toText(),
		label: metadataUiName(satellite)
	}}
>
	{#snippet intro()}
		<h2>
			<Html
				text={i18nFormat($i18n.canisters.top_up_title, [
					{
						placeholder: '{0}',
						value: metadataUiName(satellite)
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
