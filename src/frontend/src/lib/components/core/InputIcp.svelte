<script lang="ts">
	import { ICPToken, nonNullish, type TokenAmountV2 } from '@dfinity/utils';
	import { blur } from 'svelte/transition';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import SendTokensMax from '$lib/components/wallet/tokens/SendTokensMax.svelte';
	import { icpToUsd } from '$lib/derived/wallet/exchange.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { formatICPToUsd } from '$lib/utils/icp.utils';
	import { amountToToken } from '$lib/utils/token.utils';
	import { ICP_TOKEN } from '$lib/constants/wallet.constants';

	interface Props {
		balance: bigint | undefined;
		amount: string | undefined;
		fee?: bigint;
	}

	let { amount = $bindable(), balance, fee }: Props = $props();

	let token: TokenAmountV2 | undefined = $derived(amountToToken({ amount, token: ICPToken }));

	let withUsd = $derived(nonNullish($icpToUsd));

	let usd = $derived(
		nonNullish($icpToUsd) && nonNullish(token)
			? formatICPToUsd({ icp: token.toE8s(), icpToUsd: $icpToUsd })
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

<div class="input-icp">
	<Value>
		{#snippet label()}
			{$i18n.core.icp_amount}
		{/snippet}

		<Input
			name="amount"
			footer={withUsd ? footer : undefined}
			inputType="currency"
			placeholder={$i18n.wallet.amount_placeholder}
			required
			spellcheck={false}
			bind:value={amount}
		>
			{#snippet end()}
				<SendTokensMax
					{balance}
					{fee}
					selectedToken={ICP_TOKEN}
					onmax={(value) => (amount = value)}
				/>
			{/snippet}
		</Input>
	</Value>
</div>

<style lang="scss">
	.usd {
		font-size: var(--font-size-very-small);
	}
</style>
