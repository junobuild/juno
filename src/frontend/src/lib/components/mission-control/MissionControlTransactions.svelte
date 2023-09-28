<script lang="ts">
    import type {TransactionWithId} from "@junobuild/ledger";
	import {formatE8sICP} from "$lib/utils/icp.utils";
	import { fade } from "svelte/transition";

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
        			{#each transactions as {id, transaction}}
        				<tr transition:fade>
        					<td>{`${id}`}</td>
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