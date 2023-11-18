<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import CanisterStopStart from '$lib/components/canister/CanisterStopStart.svelte';
	import SatelliteDelete from '$lib/components/satellites/SatelliteDelete.svelte';
	import type { Canister } from '$lib/types/canister';
	import Actions from '$lib/components/core/Actions.svelte';

	export let satellite: Satellite;

	let detail = { satellite };

	let canister: Canister | undefined = undefined;

	const onSyncCanister = (syncCanister: Canister) => {
		if (syncCanister.id !== satellite.satellite_id.toText()) {
			return;
		}

		canister = syncCanister;
	};

	let visible: boolean | undefined;
	const close = () => (visible = false);
</script>

<svelte:window on:junoSyncCanister={({ detail: { canister } }) => onSyncCanister(canister)} />

<Actions bind:visible>
	<TopUp
		type="topup_satellite"
		{detail}
		on:junoTopUp={close}
		on:junoStop={close}
		on:junoStart={close}
		on:junoDelete={close}
	/>

	<CanisterStopStart {canister} segment="satellite" />

	<SatelliteDelete {satellite} {canister} />
</Actions>
