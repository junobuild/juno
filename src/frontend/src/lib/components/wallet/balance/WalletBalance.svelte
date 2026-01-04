<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import WalletBalanceUsd from '$lib/components/wallet/balance/WalletBalanceUsd.svelte';
	import TokenSymbol from '$lib/components/wallet/tokens/TokenSymbol.svelte';
	import {
		exchangePricesNotLoaded,
		icpToUsd,
		icpToUsdDefined
	} from '$lib/derived/wallet/exchange.derived';
	import type { SelectedToken } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		balance: bigint | undefined;
		format: (value: bigint) => string;
		selectedToken: SelectedToken;
		highlight?: boolean;
		label?: string;
	}

	let { balance, label: labelText, format, selectedToken, highlight = true }: Props = $props();
</script>

{#snippet textBalance()}
	{format(balance ?? 0n)} <TokenSymbol {selectedToken} />
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
			<span class:main={highlight} in:fade>
				{#if nonNullish($icpToUsd) && $icpToUsdDefined}
					<WalletBalanceUsd {balance} {selectedToken} />
				{:else}
					{@render textBalance()}
				{/if}
			</span>

			<span in:fade>
				{#if nonNullish($icpToUsd) && $icpToUsdDefined}
					{@render textBalance()}
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
