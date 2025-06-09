<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import IconFilter from '$lib/components/icons/IconFilter.svelte';
	import SatellitesPicker, {
		type SatellitePickerProps
	} from '$lib/components/satellites/SatellitesPicker.svelte';
	import PopoverApply from '$lib/components/ui/PopoverApply.svelte';
	import { satellitesStore } from '$lib/derived/satellites.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { navigateToUpgradeDock } from '$lib/utils/nav.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	let visible: boolean = $state(false);

	const apply = async () => {};

	const navigate = async (satelliteId: Principal | undefined) =>
		await navigateToUpgradeDock(satelliteId);

	let satellites = $derived(
		($satellitesStore ?? []).reduce<SatellitePickerProps['satellites']>(
			(acc, satellite) => [
				...acc,
				{
					satelliteId: satellite.satellite_id.toText(),
					satName: satelliteName(satellite)
				}
			],
			[]
		)
	);
</script>

<PopoverApply ariaLabel={$i18n.filter.title} onapply={apply} bind:visible direction="ltr">
	{#snippet icon()}
		<IconFilter size="18px" />
	{/snippet}

	<label for="modules">{$i18n.upgrade_dock.modules}</label>

	<div id="modules">
		<SatellitesPicker {satellites} {navigate} />
	</div>
</PopoverApply>

<style lang="scss">
	@use '../../../styles/mixins/dialog';

	@include dialog.apply;
</style>
