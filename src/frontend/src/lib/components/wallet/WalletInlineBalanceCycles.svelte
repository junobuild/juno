<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import { formatTCycles } from '$lib/utils/cycles.utils';

	interface Props {
		balance: bigint | undefined;
	}

	let { balance }: Props = $props();
</script>

{#if isNullish(balance)}
	<SkeletonText />
{:else}
	<span in:fade>{formatTCycles(balance)} <small>T Cycles</small></span>
{/if}
