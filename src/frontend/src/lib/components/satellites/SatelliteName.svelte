<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import Value from '$lib/components/ui/Value.svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import IconEdit from '$lib/components/icons/IconEdit.svelte';

	export let satellite: Satellite;

	let satelliteId: SatelliteIdText;
	$: satelliteId = satellite.satellite_id.toText();
</script>

<Value>
	<svelte:fragment slot="label">{$i18n.satellites.name}</svelte:fragment>
	<p>
		<span>{satelliteName(satellite)}</span>

		<button
			aria-label={$i18n.satellites.edit_name}
			title={$i18n.satellites.edit_name}
			class="square"
		>
			<IconEdit />
		</button>
	</p>
</Value>

<style lang="scss">
	p {
		display: inline-flex;
		align-items: center;
		gap: var(--padding-2x);
		max-width: 100%;
	}
</style>
