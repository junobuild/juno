<script lang="ts">
	import type { JunoModalDetail, JunoModalSatelliteDetail } from '$lib/types/modal';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CanisterUpgradeModal from '$lib/components/modals/CanisterUpgradeModal.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteName } from '$lib/utils/satellite.utils';

	export let detail: JunoModalDetail;

	let satellite: Satellite;

	$: ({ satellite } = detail as JunoModalSatelliteDetail);
</script>

<CanisterUpgradeModal on:junoClose>
	<svelte:fragment slot="intro">
		<h2>
			{@html i18nFormat($i18n.canisters.upgrade_title, [
				{
					placeholder: '{0}',
					value: satelliteName(satellite)
				}
			])}
		</h2>
	</svelte:fragment>
</CanisterUpgradeModal>
