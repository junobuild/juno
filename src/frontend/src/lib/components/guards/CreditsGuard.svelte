<script lang="ts">
	import MissionControlICPInfo from '$lib/components/mission-control/MissionControlICPInfo.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatE8sICP } from '$lib/utils/icp.utils';
	import { createEventDispatcher } from 'svelte';
	import type { JunoModalCreateSegmentDetail, JunoModalDetail } from '$lib/types/modal';

	export let detail: JunoModalDetail;
	export let priceLabel: string;

	let fee = 0n;
	let balance = 0n;
	let credits = 0n;

	$: fee = (detail as JunoModalCreateSegmentDetail).fee;
	$: balance = (detail as JunoModalCreateSegmentDetail).missionControlBalance?.balance ?? 0n;
	$: credits = (detail as JunoModalCreateSegmentDetail).missionControlBalance?.credits ?? 0n;

	export let insufficientFunds = true;
	$: insufficientFunds = balance + credits < fee;

	let notEnoughCredits = false;
	$: notEnoughCredits = credits < fee;

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
			},
			{
				placeholder: '{2}',
				value: formatE8sICP(credits)
			}
		])}
	</p>
{/if}

{#if insufficientFunds}
	<MissionControlICPInfo on:click={() => dispatch('junoClose')} />
{:else}
	<slot />
{/if}
