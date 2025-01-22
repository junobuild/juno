<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Snippet } from 'svelte';
	import CanisterSyncData from '$lib/components/canister/CanisterSyncData.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';

	interface Props {
		canisterId: Principal;
		cycles?: Snippet;
		heap?: Snippet;
	}

	let { canisterId, cycles, heap }: Props = $props();

	let canister = $state<CanisterSyncDataType | undefined>(undefined);

	let cyclesWarning = $derived(canister?.data?.warning?.cycles === true);

	// Disabled for now, a bit too much in your face given that wasm memory cannot be shrink. We can always activate this warning if necessary, therefore I don't remove the code.
	// heapWarning = data?.warning?.heap === true ?? false;
	let heapWarning = false;
</script>

<CanisterSyncData {canisterId} bind:canister />

{#if cyclesWarning}
	<Warning>
		{@render cycles?.()}
	</Warning>
{/if}

{#if heapWarning}
	<Warning>
		{@render heap?.()}
	</Warning>
{/if}
