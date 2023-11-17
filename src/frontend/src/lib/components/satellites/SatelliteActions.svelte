<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import SatelliteStopStart from '$lib/components/satellites/SatelliteStopStart.svelte';
	import SatelliteDelete from '$lib/components/satellites/SatelliteDelete.svelte';
	import IconMore from '$lib/components/icons/IconMore.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import type { Canister } from '$lib/types/canister';

	export let satellite: Satellite;

	let detail = { satellite };

	let button: HTMLButtonElement | undefined;
	let visible: boolean | undefined;

	const close = () => (visible = false);

	let canister: Canister | undefined = undefined;

	const onSyncCanister = (syncCanister: Canister) => {
		if (syncCanister.id !== satellite.satellite_id.toText()) {
			return;
		}

		canister = syncCanister;
	};
</script>

<svelte:window on:junoSyncCanister={({ detail: { canister } }) => onSyncCanister(canister)} />

<button class="square" bind:this={button} on:click={() => (visible = true)}><IconMore /></button>

<Popover bind:visible anchor={button} direction="rtl">
	<div class="container">
		<TopUp
			type="topup_satellite"
			{detail}
			on:junoTopUp={close}
			on:junoStop={close}
			on:junoStart={close}
			on:junoDelete={close}
		/>

		<SatelliteStopStart {satellite} {canister} />

		<SatelliteDelete {satellite} {canister} />
	</div>
</Popover>

<style lang="scss">
	button {
		position: absolute;
		top: var(--padding-2x);
		right: var(--padding-2x);
	}

	.container {
		display: flex;
		flex-direction: column;

		padding: var(--padding) var(--padding-2x);
	}
</style>
