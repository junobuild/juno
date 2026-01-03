<script lang="ts">
	import FactoryDeleteWizard from '$lib/components/factory/delete/FactoryDeleteWizard.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { satelliteCustomDomains } from '$lib/derived/satellite/satellite-custom-domains.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { JunoModalDeleteSatelliteDetail, JunoModalDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let {
		satellite,
		cycles: currentCycles,
		monitoringEnabled
	} = $derived(detail as JunoModalDeleteSatelliteDetail);
</script>

<Modal {onclose}>
	{#if $satelliteCustomDomains.length > 0}
		<h2>
			<Html
				text={i18nFormat($i18n.canisters.delete_title, [
					{
						placeholder: '{0}',
						value: 'satellite'
					}
				])}
			/>
		</h2>

		<p>
			{$i18n.canisters.delete_custom_domain}
		</p>

		<button onclick={onclose}>{$i18n.core.close}</button>
	{:else}
		<FactoryDeleteWizard
			{currentCycles}
			{monitoringEnabled}
			{onclose}
			segment="satellite"
			segmentId={satellite.satellite_id}
			segmentName={satelliteName(satellite)}
		/>
	{/if}
</Modal>
