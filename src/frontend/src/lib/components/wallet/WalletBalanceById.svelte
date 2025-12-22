<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import WalletBalance from '$lib/components/wallet/WalletBalance.svelte';
	import WalletInlineBalance from '$lib/components/wallet/WalletInlineBalance.svelte';
	import type { WalletId } from '$lib/schemas/wallet.schema';
	import { balanceCertifiedStore } from '$lib/stores/wallet/balance.store';

	interface Props {
		walletId: WalletId | undefined;
		display?: 'block' | 'inline';
	}

	let { walletId, display = 'block' }: Props = $props();

	let walletIdText = $derived(nonNullish(walletId) ? encodeIcrcAccount(walletId) : undefined);

	let balance = $derived(
		nonNullish(walletIdText) ? $balanceCertifiedStore?.[walletIdText]?.data : undefined
	);

	let Balance = $derived(display === 'inline' ? WalletInlineBalance : WalletBalance);
</script>

<Balance {balance} />
