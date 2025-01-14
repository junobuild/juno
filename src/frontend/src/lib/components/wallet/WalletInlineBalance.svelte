<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import { exchangePricesNotLoaded, icpToUsd } from '$lib/derived/exchange.derived';
	import { formatE8sICP, formatE8sICPToUsd } from '$lib/utils/icp.utils';

	interface Props {
		balance: bigint | undefined;
	}

	let { balance }: Props = $props();
</script>

{#if isNullish(balance) || $exchangePricesNotLoaded}
	<SkeletonText />
{:else if nonNullish($icpToUsd)}
	<span in:fade>{formatE8sICPToUsd({ icp: balance, icpToUsd: $icpToUsd })}</span>
{:else}
	<span in:fade>{formatE8sICP(balance)} <small>ICP</small></span>
{/if}
