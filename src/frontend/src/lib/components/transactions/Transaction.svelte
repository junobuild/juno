<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import type { IcTransactionUi } from '$lib/types/ic-transaction';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { formatToDate } from '$lib/utils/date.utils';
	import { transactionAmount, transactionMemo } from '$lib/utils/wallet.utils';

	interface Props {
		missionControlId: MissionControlId;
		transaction: IcTransactionUi;
	}

	let { missionControlId, transaction }: Props = $props();

	let id = $derived(transaction.id);

	let from = $derived(transaction.from);

	let to = $derived(transaction.to);

	let timestamp = $derived(transaction.timestamp);

	let memo = $derived(transactionMemo({ transaction, missionControlId }));

	let amount = $derived(transactionAmount(transaction));
</script>

<tr in:fade>
	<td class="id">{`${id}`}</td>
	<td class="timestamp">
		{#if nonNullish(timestamp)}
			{formatToDate(timestamp)}
		{/if}
	</td>
	<td class="from">
		{#if nonNullish(from)}
			<Identifier small={false} identifier={from} />
		{/if}
	</td>
	<td class="to">
		{#if nonNullish(to)}
			<Identifier small={false} identifier={to} />
		{/if}
	</td>
	<td class="memo">{memo}</td>
	<td class="amount">
		{#if nonNullish(amount)}
			{amount} <small>ICP</small>
		{/if}
	</td>
</tr>

<style lang="scss">
	@use '../../styles/mixins/media';

	.id,
	.timestamp,
	.memo {
		display: none;

		@include media.min-width(medium) {
			display: table-cell;
		}
	}
</style>
