<script lang="ts">
	import Confirmation from '$lib/components/core/Confirmation.svelte';
	import { exportTransactions as exportTransactionsServices } from '$lib/services/wallet.services';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import type { CertifiedTransactions } from '$lib/types/transaction';

	interface Props {
		missionControlId: MissionControlId;
		transactions: CertifiedTransactions;
	}

	let { missionControlId, transactions }: Props = $props();

	let visible = $state(false);

	const close = () => (visible = false);

	const exportTransactions = async () => {
		busy.start();

		try {
			await exportTransactionsServices({ transactions, missionControlId });
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.transactions_export,
				detail: err
			});
		}

		close();

		busy.stop();
	};
</script>

{#if transactions.length > 0}
	<button type="button" onclick={() => (visible = true)}>{$i18n.core.export}</button>
{/if}

<Confirmation bind:visible on:junoYes={exportTransactions} on:junoNo={close}>
	{#snippet title()}
		{$i18n.wallet.export_title}
	{/snippet}

	<p>{$i18n.wallet.export_info}</p>
</Confirmation>
