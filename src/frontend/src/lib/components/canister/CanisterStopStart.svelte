<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import CanisterStart from '$lib/components/canister/CanisterStart.svelte';
	import CanisterStop from '$lib/components/canister/CanisterStop.svelte';
	import type { CanisterSyncData, CanisterStatus, CanisterSyncStatus } from '$lib/types/canister';

	interface Props {
		canister?: CanisterSyncData | undefined;
		segment: 'satellite' | 'orbiter';
		onstart: () => void;
		onstop: () => void;
	}

	let { canister = undefined, segment, onstart, onstop }: Props = $props();

	let status = $derived<CanisterStatus | undefined>(canister?.data?.canister.status);
	let sync = $derived<CanisterSyncStatus | undefined>(canister?.sync);
</script>

{#if nonNullish(canister) && status === 'stopped' && sync === 'synced'}
	<div in:fade><CanisterStart {canister} {segment} {onstart} /></div>
{:else if nonNullish(canister) && status === 'running' && sync === 'synced'}
	<div in:fade><CanisterStop {canister} {segment} {onstop} /></div>
{/if}

<style lang="scss">
	div {
		display: inline-block;
	}
</style>
