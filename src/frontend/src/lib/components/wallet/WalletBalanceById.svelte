<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import WalletBalance from '$lib/components/wallet/WalletBalance.svelte';
	import WalletInlineBalance from '$lib/components/wallet/WalletInlineBalance.svelte';
	import { ICP_LEDGER_CANISTER_ID } from '$lib/constants/app.constants';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import { balanceCertifiedStore } from '$lib/stores/wallet/balance.store';

	interface Props {
		selectedWallet: SelectedWallet | undefined;
		display?: 'block' | 'inline';
	}

	let { selectedWallet, display = 'block' }: Props = $props();

	let walletIdText = $derived(
		nonNullish(selectedWallet) ? encodeIcrcAccount(selectedWallet.walletId) : undefined
	);

	let balance = $derived(
		nonNullish(walletIdText)
			? $balanceCertifiedStore?.[walletIdText]?.[ICP_LEDGER_CANISTER_ID]?.data
			: undefined
	);

	let Balance = $derived(display === 'inline' ? WalletInlineBalance : WalletBalance);
</script>

<Balance {balance} />
