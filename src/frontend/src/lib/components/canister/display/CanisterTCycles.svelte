<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import type { CanisterData } from '$lib/types/canister';
	import { formatTCycles } from '$lib/utils/cycles.utils';

	interface Props {
		cycles: bigint | undefined;
		noFallbackToZero?: boolean;
	}

	let { cycles, noFallbackToZero = false }: Props = $props();

	let displayCycles = $derived(noFallbackToZero ? cycles : (cycles ?? 0n));
</script>

{#if nonNullish(displayCycles)}
	<span in:fade>{formatTCycles(displayCycles)}T <small>Cycles</small></span>
{/if}
