<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import Canister from '$lib/components/canister/Canister.svelte';
	import type { CanisterData } from '$lib/types/canister';

	interface Props {
		cyclesWarning: boolean;
		heapWarning: boolean;
		data: CanisterData | undefined;
		canisterId: Principal | undefined;
	}

	let {
		cyclesWarning = $bindable(false),
		heapWarning = $bindable(false),
		data = $bindable(undefined),
		canisterId
	}: Props = $props();

	let canisterData = $state<CanisterData | undefined>(undefined);

	$effect(() => {
		data = canisterData;
	});

	let canisterCyclesWarning = $derived(canisterData?.warning?.cycles === true);
	let canisterHeapWarning = $derived(canisterData?.warning?.heap === true);

	$effect(() => {
		cyclesWarning = canisterCyclesWarning;
		heapWarning = canisterHeapWarning;
	});
</script>

{#if nonNullish(canisterId)}
	<Canister {canisterId} display={false} bind:data={canisterData} />
{/if}
