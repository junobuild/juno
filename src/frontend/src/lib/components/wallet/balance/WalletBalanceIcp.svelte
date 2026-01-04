<script lang="ts">
	import WalletBalance from '$lib/components/wallet/balance/WalletBalance.svelte';
	import { ICP } from '$lib/constants/token.constants';
	import { formatICP } from '$lib/utils/icp.utils';

	interface Props {
		balance: bigint | undefined;
		label?: string;
		highlight?: boolean;
	}

	let { balance, label: labelText, highlight }: Props = $props();
</script>

<WalletBalance {balance} format={formatICP} {highlight} label={labelText} selectedToken={ICP} />
