<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { blur } from 'svelte/transition';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import TokenSymbol from '$lib/components/wallet/tokens/TokenSymbol.svelte';
	import type { SelectedToken, WalletId } from '$lib/schemas/wallet.schema';
	import type { IcTransactionUi } from '$lib/types/ic-transaction';
	import { formatToDate } from '$lib/utils/date.utils';
	import { formatToken } from '$lib/utils/token.utils';
	import { transactionMemo } from '$lib/utils/wallet.utils';

	interface Props {
		walletId: WalletId;
		transaction: IcTransactionUi;
		selectedToken: SelectedToken;
	}

	let { walletId, transaction, selectedToken }: Props = $props();

	let id = $derived(transaction.id);

	let from = $derived(transaction.from);

	let to = $derived(transaction.to);

	let timestamp = $derived(transaction.timestamp);

	let memo = $derived(transactionMemo({ transaction, walletId }));

	let amount = $derived(transaction.value);
</script>

<tr in:blur={{ delay: 0, duration: 125 }}>
	<td class="id">{`${id}`}</td>
	<td class="timestamp">
		{#if nonNullish(timestamp)}
			{formatToDate(timestamp)}
		{/if}
	</td>
	<td class="from">
		{#if nonNullish(from)}
			<Identifier identifier={from} small={false} />
		{/if}
	</td>
	<td class="to">
		{#if nonNullish(to)}
			<Identifier identifier={to} small={false} />
		{/if}
	</td>
	<td class="memo">{memo}</td>
	<td class="amount">
		{#if nonNullish(amount)}
			<span
				>{formatToken({ selectedToken, amount })}
				<TokenSymbol {selectedToken} /></span
			>
		{/if}
	</td>
</tr>

<style lang="scss">
	@use '../../../styles/mixins/media';

	.id,
	.timestamp,
	.memo {
		display: none;

		@include media.min-width(medium) {
			display: table-cell;
		}
	}
</style>
