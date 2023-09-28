<script lang="ts">
	import type { TransactionWithId, Transaction } from '@junobuild/ledger';
	import { fromNullable } from '$lib/utils/did.utils';
	import { nonNullish } from '$lib/utils/utils';
	import { formatToDate } from '$lib/utils/date.utils';
	import {
		MEMO_CANISTER_CREATE,
		MEMO_CANISTER_TOP_UP,
		MEMO_ORBITER_CREATE_REFUND,
		MEMO_SATELLITE_CREATE_REFUND
	} from '$lib/constants/wallet.constants';
	import { formatE8sICP } from '$lib/utils/icp.utils';
	import { fade } from 'svelte/transition';
	import Identifier from '$lib/components/ui/Identifier.svelte';

	export let transactionWithId: TransactionWithId;

	let id: bigint;
	let transaction: Transaction;

	$: ({ id, transaction } = transactionWithId);

	let from: string;
	$: from = 'Transfer' in transaction.operation ? transaction.operation.Transfer.from : '';

	let to: string;
	$: to = 'Transfer' in transaction.operation ? transaction.operation.Transfer.to : '';

	let timestamp: bigint | undefined;
	$: timestamp = fromNullable(transaction.created_at_time)?.timestamp_nanos;
</script>

<tr in:fade>
	<td class="id">{`${id}`}</td>
	<td class="age">
		{#if nonNullish(timestamp)}
			{formatToDate(timestamp)}
		{/if}
	</td>
	<td class="from">
		<Identifier identifier={from} />
	</td>
	<td class="to">
		<Identifier identifier={to} />
	</td>
	<td class="memo"
		>{transaction.memo === MEMO_CANISTER_CREATE
			? 'Create satellite'
			: transaction.memo === MEMO_SATELLITE_CREATE_REFUND
			? 'Create satellite refund'
			: transaction.memo === MEMO_ORBITER_CREATE_REFUND
			? 'Create orbiter refund'
			: transaction.memo === MEMO_CANISTER_TOP_UP
			? 'Top-up'
			: 'Received'}</td
	>
	<td class="amount">
		{#if 'Transfer' in transaction.operation}
			{formatE8sICP(transaction.operation.Transfer.amount.e8s)} ICP
		{/if}
	</td>
</tr>

<style lang="scss">
	@use '../../styles/mixins/media';

	.id,
	.age,
	.memo {
		display: none;

		@include media.min-width(medium) {
			display: table-cell;
		}
	}
</style>
