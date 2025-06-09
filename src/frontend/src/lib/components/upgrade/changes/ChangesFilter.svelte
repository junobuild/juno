<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { onMount } from 'svelte';
	import IconFilter from '$lib/components/icons/IconFilter.svelte';
	import SatellitesPicker, {
		type SatellitePickerProps
	} from '$lib/components/satellites/SatellitesPicker.svelte';
	import PopoverApply from '$lib/components/ui/PopoverApply.svelte';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { satellitesStore } from '$lib/derived/satellites.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { navigateToChangesDock } from '$lib/utils/nav.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	let visible = $state(false);

	let satelliteId = $state<Principal | undefined>(undefined);

	onMount(() => {
		satelliteId = $satelliteStore?.satellite_id;
	});

	const apply = async () => {
		visible = false;

		await navigateToChangesDock(satelliteId);
	};

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

	<label for="modules">{$i18n.satellites.title}</label>

	<div id="modules">
		<SatellitesPicker {satellites} onChange={(id) => (satelliteId = id)} />
	</div>
</PopoverApply>

<style lang="scss">
	@use '../../../styles/mixins/dialog';

	@include dialog.apply;
</style>
