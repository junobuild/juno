<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import WalletBalanceCycles from '$lib/components/wallet/WalletBalanceCycles.svelte';
	import WalletBalanceIcp from '$lib/components/wallet/WalletBalanceIcp.svelte';
	import WalletInlineBalanceCycles from '$lib/components/wallet/WalletInlineBalanceCycles.svelte';
	import WalletInlineBalanceIcp from '$lib/components/wallet/WalletInlineBalanceIcp.svelte';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { balanceCertifiedStore } from '$lib/stores/wallet/balance.store';
	import { isTokenIcp } from '$lib/utils/token.utils';

	interface Props {
		selectedWallet: SelectedWallet | undefined;
		selectedToken: SelectedToken;
		display?: 'block' | 'inline';
	}

	let { selectedWallet, selectedToken, display = 'block' }: Props = $props();

	let walletIdText = $derived(
		nonNullish(selectedWallet) ? encodeIcrcAccount(selectedWallet.walletId) : undefined
	);

	let balance = $derived(
		nonNullish(walletIdText)
			? $balanceCertifiedStore?.[walletIdText]?.[selectedToken.ledgerId]?.data
			: undefined
	);

	let Balance = $derived(
		display === 'inline'
			? isTokenIcp(selectedToken)
				? WalletInlineBalanceIcp
				: WalletInlineBalanceCycles
			: isTokenIcp(selectedToken)
				? WalletBalanceIcp
				: WalletBalanceCycles
	);
</script>

<Balance {balance} />
