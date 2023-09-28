<script lang="ts">
	import type { TransactionWithId } from '@junobuild/ledger';
	import Transaction from '$lib/components/transactions/Transaction.svelte';
	import InfiniteScroll from '$lib/components/ui/InfiniteScroll.svelte';

	export let transactions: TransactionWithId[];
	export let disableInfiniteScroll = false;
</script>

<InfiniteScroll on:junoIntersect disabled={disableInfiniteScroll}>
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
				{#each transactions as transactionWithId (transactionWithId.id)}
					<Transaction {transactionWithId} />
				{/each}
			</tbody>
		</table>
	</div>
</InfiniteScroll>

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
