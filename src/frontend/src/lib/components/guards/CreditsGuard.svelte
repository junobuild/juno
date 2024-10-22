<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { createEventDispatcher } from 'svelte';
	import MissionControlICPInfo from '$lib/components/mission-control/MissionControlICPInfo.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { E8S_PER_ICP } from '$lib/constants/constants';
	import type { JunoModalCreateSegmentDetail, JunoModalDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatE8sICP } from '$lib/utils/icp.utils';

	export let detail: JunoModalDetail;
	export let priceLabel: string;

	let fee = 0n;
	let balance = 0n;
	let credits = 0n;
	let accountIdentifier: AccountIdentifier | undefined;

	$: fee = (detail as JunoModalCreateSegmentDetail).fee;
	$: balance = (detail as JunoModalCreateSegmentDetail).missionControlBalance?.balance ?? 0n;
	$: credits = (detail as JunoModalCreateSegmentDetail).missionControlBalance?.credits ?? 0n;
	$: accountIdentifier = (detail as JunoModalCreateSegmentDetail).missionControlBalance
		?.accountIdentifier;

	export let insufficientFunds = true;
	$: insufficientFunds = balance < fee && notEnoughCredits;

	let notEnoughCredits = false;
	$: notEnoughCredits = credits * fee < fee * E8S_PER_ICP;

	const dispatch = createEventDispatcher();
</script>

{#if notEnoughCredits}
	<p>
		<Html
			text={i18nFormat(priceLabel, [
				{
					placeholder: '{0}',
					value: formatE8sICP(fee)
				},
				{
					placeholder: '{1}',
					value: formatE8sICP(balance)
				}
			])}
		/>
	</p>
{/if}

{#if insufficientFunds}
	<MissionControlICPInfo {accountIdentifier} on:click={() => dispatch('junoClose')} />
{:else}
	<slot />
{/if}
