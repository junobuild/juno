<script lang="ts">
	import type { Snippet } from 'svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import GetICPInfo from '$lib/components/wallet/GetICPInfo.svelte';
	import { E8S_PER_ICP } from '$lib/constants/app.constants';
	import { CYCLES, ICP } from '$lib/constants/token.constants';
	import { creditsOrZero } from '$lib/derived/console/credits.derived';
	import {
		devCyclesBalanceOrZero,
		devIcpBalanceOrZero,
		missionControlCyclesBalanceOrZero,
		missionControlIcpBalanceOrZero
	} from '$lib/derived/wallet/balance.derived';
	import { icpToUsd } from '$lib/derived/wallet/exchange.derived';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import type { JunoModalCreateSegmentDetail, JunoModalDetail } from '$lib/types/modal';
	import type { Option } from '$lib/types/utils';
	import { formatCyclesToHTML } from '$lib/utils/cycles.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatICPToHTML } from '$lib/utils/icp.utils';
	import { isTokenIcp } from '$lib/utils/token.utils';
	import { fromNullable } from '@dfinity/utils';

	interface Props {
		fee: bigint;
		priceLabel: string;
		selectedWallet: SelectedWallet | undefined;
		withFee: Option<bigint>;
		insufficientFunds?: boolean;
		children: Snippet;
		onclose: () => void;
	}

	let {
		fee,
		priceLabel,
		selectedWallet,
		insufficientFunds = $bindable(true),
		withFee = $bindable(undefined),
		children,
		onclose
	}: Props = $props();

	let notEnoughCredits = $derived($creditsOrZero * fee < fee * E8S_PER_ICP);

	// Creating a module is either in cycles with dev wallet or in ICP with mission control.
	// We do not allow to switch token because we want to use only cycles anyway.
	// A dev account that has ICP is "a mistake". Mission Control being able to spin module is deprecated.
	let selectedToken = $derived<SelectedToken>(
		selectedWallet?.type === 'mission_control' ? ICP : CYCLES
	);

	let balanceOrZero = $derived(
		selectedWallet?.type === 'mission_control'
			? isTokenIcp(selectedToken)
				? $missionControlIcpBalanceOrZero
				: $missionControlCyclesBalanceOrZero
			: isTokenIcp(selectedToken)
				? $devIcpBalanceOrZero
				: $devCyclesBalanceOrZero
	);

	$effect(() => {
		insufficientFunds = balanceOrZero < fee && notEnoughCredits;
	});

	$effect(() => {
		withFee = notEnoughCredits ? fee : null;
	});
</script>

{#if notEnoughCredits}
	<p>
		<Html
			text={i18nFormat(priceLabel, [
				{
					placeholder: '{0}',
					value: isTokenIcp(selectedToken)
						? formatICPToHTML({ e8s: fee, bold: true, icpToUsd: $icpToUsd })
						: formatCyclesToHTML({ e12s: fee, bold: true })
				},
				{
					placeholder: '{1}',
					value: isTokenIcp(selectedToken)
						? formatICPToHTML({ e8s: balanceOrZero, bold: false, icpToUsd: $icpToUsd })
						: formatCyclesToHTML({ e12s: balanceOrZero, bold: false })
				}
			])}
		/>
	</p>
{/if}

{#if insufficientFunds}
	<GetICPInfo {onclose} />
{:else}
	{@render children()}
{/if}
