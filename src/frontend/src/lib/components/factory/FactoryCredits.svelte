<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import MissionControlICPInfo from '$lib/components/mission-control/MissionControlICPInfo.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { E8S_PER_ICP } from '$lib/constants/app.constants';
	import { creditsOrZero } from '$lib/derived/console/credits.derived';
	import { devId } from '$lib/derived/dev.derived';
	import {
		devBalanceOrZero,
		missionControlBalanceOrZero
	} from '$lib/derived/wallet/balance.derived';
	import { icpToUsd } from '$lib/derived/wallet/exchange.derived';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import type { JunoModalCreateSegmentDetail, JunoModalDetail } from '$lib/types/modal';
	import type { Option } from '$lib/types/utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { toAccountIdentifier } from '$lib/utils/icp-icrc-account.utils';
	import { formatICPToHTML } from '$lib/utils/icp.utils';

	interface Props {
		detail: JunoModalDetail;
		priceLabel: string;
		selectedWallet: SelectedWallet | undefined;
		withFee: Option<bigint>;
		insufficientFunds?: boolean;
		children: Snippet;
		onclose: () => void;
	}

	let {
		detail,
		priceLabel,
		selectedWallet,
		insufficientFunds = $bindable(true),
		withFee = $bindable(undefined),
		children,
		onclose
	}: Props = $props();

	let { fee } = $derived(detail as JunoModalCreateSegmentDetail);

	let notEnoughCredits = $derived($creditsOrZero * fee < fee * E8S_PER_ICP);

	let balanceOrZero = $derived(
		selectedWallet?.type === 'mission_control' ? $missionControlBalanceOrZero : $devBalanceOrZero
	);

	// When both wallets - dev and mission control - are empty and devs are no credits left,
	// there is no advance options displayed as result, therefore is no selected wallet
	let fallbackDevWallet = $derived(nonNullish($devId) ? { owner: $devId } : undefined);

	let accountIdentifier = $derived(
		nonNullish(selectedWallet?.walletId)
			? toAccountIdentifier(selectedWallet.walletId)
			: nonNullish(fallbackDevWallet)
				? toAccountIdentifier(fallbackDevWallet)
				: undefined
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
					value: formatICPToHTML({ e8s: fee, bold: true, icpToUsd: $icpToUsd })
				},
				{
					placeholder: '{1}',
					value: formatICPToHTML({ e8s: balanceOrZero, bold: false, icpToUsd: $icpToUsd })
				}
			])}
		/>
	</p>
{/if}

{#if insufficientFunds}
	<MissionControlICPInfo {accountIdentifier} {onclose} />
{:else}
	{@render children()}
{/if}
