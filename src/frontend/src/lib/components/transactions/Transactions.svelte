<script lang="ts">
	import type { TransactionWithId } from '@junobuild/ledger';
	import Transaction from '$lib/components/transactions/Transaction.svelte';
	import InfiniteScroll from '$lib/components/ui/InfiniteScroll.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Principal } from '@dfinity/principal';

	export let missionControlId: Principal;
	export let transactions: TransactionWithId[];
	export let disableInfiniteScroll = false;
</script>

<InfiniteScroll on:junoIntersect disabled={disableInfiniteScroll}>
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th class="id"> {$i18n.wallet.tx_id} </th>
					<th class="timestamp"> {$i18n.wallet.tx_timestamp} </th>
					<th class="from"> {$i18n.wallet.tx_from} </th>
					<th class="to"> {$i18n.wallet.tx_to} </th>
					<th class="memo"> {$i18n.wallet.tx_memo} </th>
					<th class="amount"> {$i18n.wallet.tx_amount} </th>
				</tr>
			</thead>

			<tbody>
				{#each transactions as transactionWithId (transactionWithId.id)}
					<Transaction {transactionWithId} {missionControlId} />
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
	.timestamp,
	.memo {
		display: none;

		@include media.min-width(medium) {
			display: table-cell;
		}
	}
</style>
