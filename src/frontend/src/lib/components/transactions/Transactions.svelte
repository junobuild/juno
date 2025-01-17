<script lang="ts">
	import Transaction from '$lib/components/transactions/Transaction.svelte';
	import InfiniteScroll from '$lib/components/ui/InfiniteScroll.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import type { CertifiedTransactions } from '$lib/types/transaction';

	interface Props {
		missionControlId: MissionControlId;
		transactions: CertifiedTransactions;
		disableInfiniteScroll?: boolean;
		onintersect: () => void;
	}

	let {
		missionControlId,
		transactions,
		onintersect,
		disableInfiniteScroll = false
	}: Props = $props();
</script>

{#if transactions.length > 0}
	<InfiniteScroll {onintersect} disabled={disableInfiniteScroll}>
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
					{#each transactions as transaction, index (`${transaction.data.id}-${index}`)}
						<Transaction transaction={transaction.data} {missionControlId} />
					{/each}
				</tbody>
			</table>
		</div>
	</InfiniteScroll>
{/if}

<style lang="scss">
	@use '../../styles/mixins/media';

	.table-container {
		margin: var(--padding-6x) 0 var(--padding-4x);
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
