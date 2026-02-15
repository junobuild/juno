<script lang="ts">
	import { nonNullish, type TokenAmountV2 } from '@dfinity/utils';
	import { blur } from 'svelte/transition';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import SendTokensMax from '$lib/components/wallet/tokens/SendTokensMax.svelte';
	import { CYCLES, CyclesToken } from '$lib/constants/token.constants';
	import { icpToUsd } from '$lib/derived/wallet/exchange.derived';
	import { icpToCyclesRate } from '$lib/derived/wallet/rate.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { cyclesToIcpE8s } from '$lib/utils/cycles.utils';
	import { formatICPToUsd } from '$lib/utils/icp.utils';
	import { amountToToken } from '$lib/utils/token.utils';

	interface Props {
		balance: bigint | undefined;
		amount: string | undefined;
		amountLabel?: 'canister' | 'token';
		fee?: bigint;
	}

	let { amount = $bindable(), balance, fee, amountLabel = 'canister' }: Props = $props();

	let token: TokenAmountV2 | undefined = $derived(amountToToken({ amount, token: CyclesToken }));

	let withUsd = $derived(nonNullish($icpToUsd) && nonNullish($icpToCyclesRate));

	let usd = $derived(
		nonNullish($icpToUsd) && nonNullish($icpToCyclesRate) && nonNullish(token)
			? formatICPToUsd({
					icp: cyclesToIcpE8s({
						cycles: token.toUlps(),
						trillionRatio: $icpToCyclesRate
					}),
					icpToUsd: $icpToUsd
				})
			: undefined
	);
</script>

{#snippet footer()}
	<span class="usd">
		{#if nonNullish(usd)}
			<span in:blur>{usd}</span>
		{:else}
			&ZeroWidthSpace;
		{/if}
	</span>
{/snippet}

<div class="input-cycles">
	<Value>
		{#snippet label()}
			{amountLabel === 'token' ? $i18n.core.token_cycles_amount : $i18n.core.canister_cycles_amount}
		{/snippet}

		<Input
			name="amount"
			decimals={CyclesToken.decimals}
			footer={withUsd ? footer : undefined}
			inputType="currency"
			placeholder={$i18n.wallet.amount_placeholder}
			required
			spellcheck={false}
			bind:value={amount}
		>
			{#snippet end()}
				<SendTokensMax {balance} {fee} onmax={(value) => (amount = value)} selectedToken={CYCLES} />
			{/snippet}
		</Input>
	</Value>
</div>

<style lang="scss">
	.usd {
		font-size: var(--font-size-very-small);
	}
</style>
