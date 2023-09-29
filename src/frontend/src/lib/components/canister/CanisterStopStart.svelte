<script lang="ts">
	import type { Canister, CanisterStatus } from '$lib/types/canister';
	import CanisterStart from '$lib/components/canister/CanisterStart.svelte';
	import CanisterStop from '$lib/components/canister/CanisterStop.svelte';
	import { fade } from 'svelte/transition';
	import type {Satellite} from "$declarations/mission_control/mission_control.did";

	export let satellite: Satellite;

	const onSyncCanister = (syncCanister: Canister) => {
		if (syncCanister.id !== satellite.satellite_id.toText()) {
			return;
		}

		canister = syncCanister;
	}

	let canister: Canister | undefined = undefined;
	let status: CanisterStatus | undefined = undefined;

	$: status = canister?.data?.status;
</script>

<svelte:window on:junoSyncCanister={({ detail: { canister } }) => onSyncCanister(canister)} />

{#if status === 'stopped'}
	<div in:fade><CanisterStart {satellite} /></div>
{:else if status === 'running'}
	<div in:fade><CanisterStop {satellite} /></div>
{/if}

<style lang="scss">
	div {
		display: inline-block;
	}
</style>