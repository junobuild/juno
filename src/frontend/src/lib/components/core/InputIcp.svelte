<script lang="ts">
	import { nonNullish, type TokenAmountV2 } from '@dfinity/utils';
	import { blur } from 'svelte/transition';
	import SendTokensMax from '$lib/components/tokens/SendTokensMax.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { icpToUsd } from '$lib/derived/exchange.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { formatICPToUsd } from '$lib/utils/icp.utils';
	import { amountToICPToken } from '$lib/utils/token.utils';

	interface Props {
		balance: bigint | undefined;
		amount: string | undefined;
		fee?: bigint;
	}

	let { amount = $bindable(), balance, fee }: Props = $props();

	let token: TokenAmountV2 | undefined = $derived(amountToICPToken(amount));

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
			inputType="currency"
			required
			bind:value={amount}
			spellcheck={false}
			placeholder={$i18n.wallet.amount_placeholder}
			footer={withUsd ? footer : undefined}
		>
			{#snippet end()}
				<SendTokensMax {balance} onmax={(value) => (amount = value)} {fee} />
			{/snippet}
		</Input>
	</Value>
</div>

<style lang="scss">
	.usd {
		font-size: var(--font-size-very-small);
	}
</style>
