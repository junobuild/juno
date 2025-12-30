<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import {
		exchangePricesNotLoaded,
		icpToUsd,
		icpToUsdDefined
	} from '$lib/derived/wallet/exchange.derived';
	import { formatICP, formatICPToUsd } from '$lib/utils/icp.utils';
	import WalletBalanceUsd from "$lib/components/wallet/WalletBalanceUsd.svelte";
	import {ICP_TOKEN} from "$lib/constants/wallet.constants";

	interface Props {
		balance: bigint | undefined;
	}

	let { balance }: Props = $props();
</script>

{#if isNullish(balance) || $exchangePricesNotLoaded}
	<SkeletonText />
{:else if nonNullish($icpToUsd) && $icpToUsdDefined}
	<span in:fade><WalletBalanceUsd selectedToken={ICP_TOKEN} {balance} /></span>
{:else}
	<span in:fade>{formatICP(balance)} <small>ICP</small></span>
{/if}
