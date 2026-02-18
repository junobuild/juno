<script lang="ts">
	import Confirmation from '$lib/components/app/core/Confirmation.svelte';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { exportTransactions as exportTransactionsServices } from '$lib/services/wallet/wallet.transactions.services';
	import { busy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import type { CertifiedTransactions } from '$lib/types/transaction';

	interface Props {
		selectedWallet: SelectedWallet;
		selectedToken: SelectedToken;
		transactions: CertifiedTransactions;
	}

	let { selectedWallet, selectedToken, transactions }: Props = $props();

	const { walletId } = $derived(selectedWallet);

	let visible = $state(false);

	const close = () => (visible = false);

	const exportTransactions = async () => {
		busy.start();

		try {
			await exportTransactionsServices({ transactions, walletId, selectedToken });
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
	<button onclick={() => (visible = true)} type="button">{$i18n.core.export}</button>
{/if}

<Confirmation onno={close} onyes={exportTransactions} bind:visible>
	{#snippet title()}
		{$i18n.wallet.export_title}
	{/snippet}

	<p>{$i18n.wallet.export_info}</p>
</Confirmation>
