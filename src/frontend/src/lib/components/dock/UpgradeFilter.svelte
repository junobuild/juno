<script lang="ts">
	import PopoverApply from '$lib/components/ui/PopoverApply.svelte';
	import IconFilter from '$lib/components/icons/IconFilter.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type {Principal} from "@dfinity/principal";
    import {navigateToUpgradeDock} from "$lib/utils/nav.utils";
    import {satelliteName} from "$lib/utils/satellite.utils";
    import {satellitesStore} from "$lib/derived/satellites.derived";
    import SatellitesPicker, {type SatellitePickerProps} from "$lib/components/satellites/SatellitesPicker.svelte";

	let visible: boolean = $state(false);

	// eslint-disable-next-line require-await
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
		<SatellitesPicker {satellites} onChange={navigate} />
	</div>
</PopoverApply>

<style lang="scss">
  @use '../../styles/mixins/dialog';

  @include dialog.apply;
</style>