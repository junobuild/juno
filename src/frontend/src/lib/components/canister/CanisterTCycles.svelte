<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import type { CanisterData } from '$lib/types/canister';
	import { formatTCycles } from '$lib/utils/cycles.utils';

	export let data: CanisterData | undefined = undefined;

	let cycles: bigint | undefined;
	$: cycles = data?.canister?.cycles;
</script>

{#if nonNullish(cycles)}
	<span in:fade>{formatTCycles(cycles)}T <small>cycles</small></span>
{/if}
