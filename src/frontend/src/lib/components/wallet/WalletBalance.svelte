<script lang="ts">
	import { fade } from 'svelte/transition';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { formatE8sICP, formatE8sICPToUsd } from '$lib/utils/icp.utils';
	import { exchangePricesNotLoaded, icpToUsd } from '$lib/derived/exchange.derived';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		balance: bigint | undefined;
	}

	let { balance }: Props = $props();
</script>

{#snippet icpBalance()}
	{formatE8sICP(balance ?? 0n)} <small>ICP</small>
{/snippet}

<Value>
	{#snippet label()}
		{$i18n.wallet.balance}
	{/snippet}

	<p>
		{#if isNullish(balance) || $exchangePricesNotLoaded}
			<span class="skeleton main"><SkeletonText /></span>
			<span class="skeleton"><SkeletonText /></span>
		{:else}
			<span in:fade class="main">
				{#if nonNullish($icpToUsd)}
					{formatE8sICPToUsd({ icp: balance, icpToUsd: $icpToUsd })}
				{:else}
					{@render icpBalance()}
				{/if}
			</span>

			<span in:fade>
				{#if nonNullish($icpToUsd)}
					{@render icpBalance()}
				{/if}</span
			>
		{/if}
	</p>
</Value>

<style lang="scss">
	span {
		display: block;
		color: var(--text-color);
	}

	.main {
		font-size: var(--font-size-h2);
		font-weight: var(--font-weight-bold);
	}

	.skeleton {
		display: block;
		padding: var(--padding-0_5x) 0 0;
		max-width: 350px;
		min-width: 150px;
	}
</style>
