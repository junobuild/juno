<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import WalletBalanceIcp from '$lib/components/wallet/WalletBalanceIcp.svelte';
	import WalletInlineBalanceIcp from '$lib/components/wallet/WalletInlineBalanceIcp.svelte';
	import type { LedgerIdText, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { balanceCertifiedStore } from '$lib/stores/wallet/balance.store';
	import { ICP_LEDGER_CANISTER_ID } from '$lib/constants/app.constants';
	import WalletInlineBalanceCycles from '$lib/components/wallet/WalletInlineBalanceCycles.svelte';
	import WalletBalanceCycles from '$lib/components/wallet/WalletBalanceCycles.svelte';

	interface Props {
		selectedWallet: SelectedWallet | undefined;
		ledgerId: LedgerIdText;
		display?: 'block' | 'inline';
	}

	let { selectedWallet, ledgerId, display = 'block' }: Props = $props();

	let walletIdText = $derived(
		nonNullish(selectedWallet) ? encodeIcrcAccount(selectedWallet.walletId) : undefined
	);

	let balance = $derived(
		nonNullish(walletIdText) ? $balanceCertifiedStore?.[walletIdText]?.[ledgerId]?.data : undefined
	);

	let Balance = $derived(
		display === 'inline'
			? ledgerId === ICP_LEDGER_CANISTER_ID
				? WalletInlineBalanceIcp
				: WalletInlineBalanceCycles
			: ledgerId === ICP_LEDGER_CANISTER_ID
				? WalletBalanceIcp
				: WalletBalanceCycles
	);
</script>

<Balance {balance} />
