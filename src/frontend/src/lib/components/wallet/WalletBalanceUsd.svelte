<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { icpToUsd, icpToUsdDefined } from '$lib/derived/wallet/exchange.derived';
	import { icpToCyclesRate } from '$lib/derived/wallet/rate.derived';
	import type { SelectedToken } from '$lib/schemas/wallet.schema';
	import { cyclesToIcpE8s } from '$lib/utils/cycles.utils';
	import { formatICPToUsd } from '$lib/utils/icp.utils.js';
	import { isTokenIcp } from '$lib/utils/token.utils';

	interface Props {
		balance: bigint;
		selectedToken: SelectedToken;
	}

	let { balance, selectedToken }: Props = $props();

	let icp = $derived(
		isTokenIcp(selectedToken)
			? balance
			: nonNullish($icpToCyclesRate)
				? cyclesToIcpE8s({
						cycles: balance,
						trillionRatio: $icpToCyclesRate
					})
				: undefined
	);

	let usd = $derived(
		nonNullish($icpToUsd) && $icpToUsdDefined && nonNullish(icp)
			? formatICPToUsd({
					icp,
					icpToUsd: $icpToUsd
				})
			: undefined
	);
</script>

{#if nonNullish(usd)}
	<span>{usd}</span>
{/if}
