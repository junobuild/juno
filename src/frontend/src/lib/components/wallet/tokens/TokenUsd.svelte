<script lang="ts">
	import { nonNullish, type TokenAmountV2 } from '@dfinity/utils';
	import { icpToUsd, icpToUsdDefined } from '$lib/derived/wallet/exchange.derived';
	import { icpToCyclesRate } from '$lib/derived/wallet/rate.derived';
	import type { SelectedToken } from '$lib/schemas/wallet.schema';
	import { cyclesToIcpE8s } from '$lib/utils/cycles.utils';
	import { formatICPToUsd } from '$lib/utils/icp.utils.js';
	import { isTokenIcp } from '$lib/utils/token.utils';

	interface Props {
		token: TokenAmountV2 | undefined;
		selectedToken: SelectedToken;
	}

	let { token, selectedToken }: Props = $props();

	let icp = $derived(
		isTokenIcp(selectedToken)
			? token?.toE8s()
			: nonNullish(token) && nonNullish($icpToCyclesRate)
				? cyclesToIcpE8s({
						cycles: token.toUlps(),
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
	<span class="usd">{usd}</span>
{/if}

<style lang="scss">
	.usd {
		display: block;
		font-size: var(--font-size-small);
	}
</style>
