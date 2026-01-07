<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import WalletBalanceCycles from '$lib/components/wallet/balance/WalletBalanceCycles.svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { balance } from '$lib/derived/wallet/balance.derived';
	import { i18n } from '$lib/stores/app/i18n.store';

	let label = $derived(nonNullish($missionControlId) ? $i18n.wallet.total : undefined);
</script>

<WalletBalanceCycles balance={$balance} {label} />
