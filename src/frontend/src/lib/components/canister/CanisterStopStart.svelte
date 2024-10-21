<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import CanisterStart from '$lib/components/canister/CanisterStart.svelte';
	import CanisterStop from '$lib/components/canister/CanisterStop.svelte';
	import type { CanisterIcStatus, CanisterStatus, CanisterSyncStatus } from '$lib/types/canister';

	export let canister: CanisterIcStatus | undefined = undefined;
	export let segment: 'satellite' | 'orbiter';

	let status: CanisterStatus | undefined = undefined;
	let sync: CanisterSyncStatus | undefined = undefined;

	$: status = canister?.data?.canister.status;
	$: sync = canister?.sync;
</script>

{#if nonNullish(canister) && status === 'stopped' && sync === 'synced'}
	<div in:fade><CanisterStart {canister} {segment} /></div>
{:else if nonNullish(canister) && status === 'running' && sync === 'synced'}
	<div in:fade><CanisterStop {canister} {segment} /></div>
{/if}

<style lang="scss">
	div {
		display: inline-block;
	}
</style>
