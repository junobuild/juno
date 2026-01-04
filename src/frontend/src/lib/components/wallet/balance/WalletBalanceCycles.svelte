<script lang="ts">
	import WalletBalance from '$lib/components/wallet/balance/WalletBalance.svelte';
	import { CYCLES, ICP } from '$lib/constants/token.constants';
	import { formatTCycles } from '$lib/utils/cycles.utils';

	interface Props {
		balance: bigint | undefined;
		label?: string;
		highlight?: boolean;
	}

	let { balance, label: labelText, highlight }: Props = $props();
</script>

<WalletBalance
	{balance}
	format={formatTCycles}
	{highlight}
	label={labelText}
	selectedToken={CYCLES}
/>
