<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import {
		exchangePricesNotLoaded,
		icpToUsd,
		icpToUsdDefined
	} from '$lib/derived/wallet/exchange.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { formatICP, formatICPToUsd } from '$lib/utils/icp.utils';
	import { formatTCycles } from '$lib/utils/cycles.utils';

	interface Props {
		balance: bigint | undefined;
		label?: string;
	}

	let { balance, label: labelText }: Props = $props();
</script>

<Value>
	{#snippet label()}
		{labelText ?? $i18n.wallet.balance}
	{/snippet}

	<p>
		{#if isNullish(balance)}
			<span class="skeleton main"><SkeletonText /></span>
		{:else}
			<span class="main" in:fade>
				{formatTCycles(balance ?? 0n)} <small>T Cycles</small>
			</span>
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
