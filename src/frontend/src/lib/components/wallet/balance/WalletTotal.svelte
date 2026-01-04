<script lang="ts">
	import WalletBalanceCycles from '$lib/components/wallet/balance/WalletBalanceCycles.svelte';
	import { balance } from '$lib/derived/wallet/balance.derived';
</script>

<WalletBalanceCycles balance={$balance} />
