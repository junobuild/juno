<script lang="ts">
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import { listTransactions } from '$lib/api/mission-control.api';
	import { formatE8sICP } from '$lib/utils/icp.utils';
	import { toasts } from '$lib/stores/toasts.store';
	import type { Transaction } from '$declarations/mission_control/mission_control.did';
	import { nonNullish } from '$lib/utils/utils';

	let transactions: Transaction[] = [];

	const loadTransactions = async () => {
		try {
			transactions = await listTransactions({ missionControlId: $missionControlStore });
		} catch (err: unknown) {
			toasts.error({
				text: `Error while listing the transactions.`,
				detail: err
			});
		}
	};

	$: $missionControlStore, $satelliteStore, (async () => await loadTransactions())();
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="block_index"> Block Index </th>
				<th class="memo"> Memo </th>
				<th class="amount"> Amount </th>
			</tr>
		</thead>

		<tbody>
			{#each transactions as transaction}
				<tr>
					<td>{transaction.block_index}</td>
					<td
						>{transaction.memo === 1095062083n
							? 'Create satellite'
							: transaction.memo === 19217561964265811n
							? 'Create satellite refund'
							: transaction.memo === 1347768404n
							? 'Top-up satellite'
							: 'Received'}</td
					>
					<td>
						{#if nonNullish(transaction.operation[0]) && 'Transfer' in transaction.operation[0]}
							{formatE8sICP(transaction.operation[0].Transfer.amount.e8s)} ICP
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
