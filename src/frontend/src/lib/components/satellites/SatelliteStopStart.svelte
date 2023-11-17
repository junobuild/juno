<script lang="ts">
	import type { Canister, CanisterStatus, CanisterSyncStatus } from '$lib/types/canister';
	import SatelliteStart from '$lib/components/satellites/SatelliteStart.svelte';
	import SatelliteStop from '$lib/components/satellites/SatelliteStop.svelte';
	import { fade } from 'svelte/transition';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';

	export let satellite: Satellite;
	export let canister: Canister | undefined = undefined;

	let status: CanisterStatus | undefined = undefined;
	let sync: CanisterSyncStatus | undefined = undefined;

	$: status = canister?.data?.status;
	$: sync = canister?.sync;
</script>

{#if status === 'stopped' && sync === 'synced'}
	<div in:fade><SatelliteStart {satellite} /></div>
{:else if status === 'running' && sync === 'synced'}
	<div in:fade><SatelliteStop {satellite} /></div>
{/if}

<style lang="scss">
	div {
		display: inline-block;
	}
</style>
