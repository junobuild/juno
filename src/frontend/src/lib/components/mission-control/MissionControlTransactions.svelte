<script lang="ts">
	import type { TransactionWithId } from '@junobuild/ledger';
	import { formatE8sICP } from '$lib/utils/icp.utils';
	import { fade } from 'svelte/transition';
	import {
		MEMO_CANISTER_CREATE,
		MEMO_CANISTER_TOP_UP,
		MEMO_ORBITER_CREATE_REFUND,
		MEMO_SATELLITE_CREATE_REFUND
	} from '$lib/constants/wallet.constants';
	import { formatToDate } from '$lib/utils/date.utils';
	import { nonNullish } from '$lib/utils/utils';
	import { fromNullable } from '$lib/utils/did.utils';
	import Identifier from '$lib/components/ui/Identifier.svelte';

	export let transactions: TransactionWithId[];

	$: console.log(transactions);
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="id"> ID </th>
				<th class="age"> Timestamp </th>
				<th class="from"> From </th>
				<th class="to"> To </th>
				<th class="memo"> Memo </th>
				<th class="amount"> Amount </th>
			</tr>
		</thead>

		<tbody>
			{#each transactions as { id, transaction }}
				{@const from =
					'Transfer' in transaction.operation ? transaction.operation.Transfer.from : ''}
				{@const to = 'Transfer' in transaction.operation ? transaction.operation.Transfer.to : ''}
				{@const timestamp = fromNullable(transaction.created_at_time)?.timestamp_nanos}

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
			{/each}
		</tbody>
	</table>
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	.table-container {
		margin: var(--padding-6x) 0;
	}

	.id {
		width: 88px;
	}

	.id,
	.age,
	.memo {
		display: none;

		@include media.min-width(medium) {
			display: table-cell;
		}
	}
</style>
