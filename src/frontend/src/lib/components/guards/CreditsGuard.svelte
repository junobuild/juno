<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import MissionControlICPInfo from '$lib/components/mission-control/MissionControlICPInfo.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { E8S_PER_ICP } from '$lib/constants/constants';
	import { icpToUsd } from '$lib/derived/exchange.derived';
	import type { JunoModalCreateSegmentDetail, JunoModalDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatICP, formatICPToUsd } from '$lib/utils/icp.utils';

	interface Props {
		detail: JunoModalDetail;
		priceLabel: string;
		insufficientFunds?: boolean;
		children: Snippet;
		onclose: () => void;
	}

	let {
		detail,
		priceLabel,
		insufficientFunds = $bindable(true),
		children,
		onclose
	}: Props = $props();

	let accountIdentifier: AccountIdentifier | undefined = $derived(
		(detail as JunoModalCreateSegmentDetail).missionControlBalance?.accountIdentifier
	);

	let { fee } = $derived(detail as JunoModalCreateSegmentDetail);
	let balance = $derived(
		(detail as JunoModalCreateSegmentDetail).missionControlBalance?.balance ?? 0n
	);
	let credits = $derived(
		(detail as JunoModalCreateSegmentDetail).missionControlBalance?.credits ?? 0n
	);

	let notEnoughCredits = $derived(credits * fee < fee * E8S_PER_ICP);

	$effect(() => {
		insufficientFunds = balance < fee && notEnoughCredits;
	});

	const priceValue = ({ e8s, bold }: { e8s: bigint; bold: boolean }): string => {
		const tag = bold ? 'strong' : 'span';

		const icpValue = (): string => `<${tag}>${formatICP(e8s)} <small>ICP</small></${tag}>`;

		if (nonNullish($icpToUsd)) {
			return `${icpValue()} <small>(${formatICPToUsd({ icp: e8s, icpToUsd: $icpToUsd })})</small>`;
		}

		return icpValue();
	};
</script>

{#if notEnoughCredits}
	<p>
		<Html
			text={i18nFormat(priceLabel, [
				{
					placeholder: '{0}',
					value: priceValue({ e8s: fee, bold: true })
				},
				{
					placeholder: '{1}',
					value: priceValue({ e8s: balance, bold: false })
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
