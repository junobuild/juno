<script lang="ts">
	import type { Canister, CanisterStatus } from '$lib/types/canister';
	import CanisterStart from '$lib/components/canister/CanisterStart.svelte';
	import CanisterStop from '$lib/components/canister/CanisterStop.svelte';
	import { fade } from 'svelte/transition';

	let canister: Canister | undefined = undefined;
	let status: CanisterStatus | undefined = undefined;

	$: status = canister?.data?.status;
</script>

<svelte:window on:junoSyncCanister={({ detail: { canister: c } }) => (canister = c)} />

{#if status === 'stopped'}
	<div in:fade><CanisterStart /></div>
{:else if status === 'running'}
	<div in:fade><CanisterStop /></div>
{/if}

<style lang="scss">
	div {
		display: inline-block;
	}
</style>