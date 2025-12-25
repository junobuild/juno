<script lang="ts">
	import WalletBalance from '$lib/components/wallet/WalletBalance.svelte';
	import WalletInlineBalance from '$lib/components/wallet/WalletInlineBalance.svelte';
	import { balance } from '$lib/derived/wallet/balance.derived';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		display?: 'block' | 'inline';
	}

	let { display = 'block' }: Props = $props();

	let Balance = $derived(display === 'inline' ? WalletInlineBalance : WalletBalance);
</script>

<Balance balance={$balance} label={$i18n.wallet.total} />
