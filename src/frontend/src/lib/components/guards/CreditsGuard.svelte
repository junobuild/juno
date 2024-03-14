<script lang="ts">
	import MissionControlICPInfo from '$lib/components/mission-control/MissionControlICPInfo.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatE8sICP } from '$lib/utils/icp.utils';
	import { createEventDispatcher } from 'svelte';
	import type { JunoModalCreateSegmentDetail, JunoModalDetail } from '$lib/types/modal';
	import type { AccountIdentifier } from '@junobuild/ledger';
	import { E8S_PER_ICP } from '$lib/constants/constants';

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
		{@html i18nFormat(priceLabel, [
			{
				placeholder: '{0}',
				value: formatE8sICP(fee)
			},
			{
				placeholder: '{1}',
				value: formatE8sICP(balance)
			}
		])}
	</p>
{/if}

{#if insufficientFunds}
	<MissionControlICPInfo {accountIdentifier} on:click={() => dispatch('junoClose')} />
{:else}
	<slot />
{/if}
