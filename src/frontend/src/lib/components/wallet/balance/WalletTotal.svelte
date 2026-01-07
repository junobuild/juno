<script lang="ts">
	import WalletBalanceCycles from '$lib/components/wallet/balance/WalletBalanceCycles.svelte';
	import { balance } from '$lib/derived/wallet/balance.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { nonNullish } from '@dfinity/utils';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';

	let label = $derived(nonNullish($missionControlId) ? $i18n.wallet.total : undefined);
</script>

<WalletBalanceCycles balance={$balance} {label} />
