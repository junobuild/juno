<script lang="ts">
	import WalletBalanceCycles from '$lib/components/wallet/balance/WalletBalanceCycles.svelte';
	import { balance } from '$lib/derived/wallet/balance.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
</script>

<WalletBalanceCycles balance={$balance} label={$i18n.wallet.total} />
