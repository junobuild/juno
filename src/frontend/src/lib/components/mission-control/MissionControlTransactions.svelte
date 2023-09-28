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

	export let transactions: TransactionWithId[];
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="block_index"> ID </th>
				<th class="memo"> Memo </th>
				<th class="amount"> Amount </th>
			</tr>
		</thead>

		<tbody>
			{#each transactions as { id, transaction }}
				<tr in:fade>
					<td>{`${id}`}</td>
					<td
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
					<td>
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
	.table-container {
		margin: var(--padding-6x) 0;
	}
</style>
