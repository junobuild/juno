<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import WalletBalanceUsd from '$lib/components/wallet/WalletBalanceUsd.svelte';
	import { ICP } from '$lib/constants/token.constants';
	import {
		exchangePricesNotLoaded,
		icpToUsd,
		icpToUsdDefined
	} from '$lib/derived/wallet/exchange.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { formatICP } from '$lib/utils/icp.utils';

	interface Props {
		balance: bigint | undefined;
		label?: string;
	}

	let { balance, label: labelText }: Props = $props();
</script>

{#snippet icpBalance()}
	{formatICP(balance ?? 0n)} <small>ICP</small>
{/snippet}

<Value>
	{#snippet label()}
		{labelText ?? $i18n.wallet.balance}
	{/snippet}

	<p>
		{#if isNullish(balance) || $exchangePricesNotLoaded}
			<span class="skeleton main"><SkeletonText /></span>
			<span class="skeleton"><SkeletonText /></span>
		{:else}
			<span class="main" in:fade>
				{#if nonNullish($icpToUsd) && $icpToUsdDefined}
					<WalletBalanceUsd {balance} selectedToken={ICP} />
				{:else}
					{@render icpBalance()}
				{/if}
			</span>

			<span in:fade>
				{#if nonNullish($icpToUsd) && $icpToUsdDefined}
					{@render icpBalance()}
				{/if}</span
			>
		{/if}
	</p>
</Value>

<style lang="scss">
	span {
		display: block;
	}

	.main {
		font-size: var(--font-size-h2);
		line-height: var(--line-height-title);
		font-weight: var(--font-weight-bold);
		color: var(--color-secondary);
	}

	.skeleton {
		display: block;
		padding: var(--padding-0_5x) 0 0;
		max-width: 350px;
		min-width: 150px;
	}
</style>
