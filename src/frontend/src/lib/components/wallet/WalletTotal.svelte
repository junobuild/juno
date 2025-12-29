<script lang="ts">
	import WalletBalanceCycles from '$lib/components/wallet/WalletBalanceCycles.svelte';
	import WalletInlineBalanceCycles from '$lib/components/wallet/WalletInlineBalanceCycles.svelte';
	import { balance } from '$lib/derived/wallet/balance.derived';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		display?: 'block' | 'inline';
	}

	let { display = 'block' }: Props = $props();

	let Balance = $derived(display === 'inline' ? WalletInlineBalanceCycles : WalletBalanceCycles);
</script>

<Balance balance={$balance} label={$i18n.wallet.total} />
