<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { createEventDispatcher } from 'svelte';
	import { run } from 'svelte/legacy';
	import MissionControlICPInfo from '$lib/components/mission-control/MissionControlICPInfo.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { E8S_PER_ICP } from '$lib/constants/constants';
	import type { JunoModalCreateSegmentDetail, JunoModalDetail } from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatE8sICP } from '$lib/utils/icp.utils';

	let fee = $state(0n);
	let balance = $state(0n);
	let credits = $state(0n);
	let accountIdentifier: AccountIdentifier | undefined = $derived(
		(detail as JunoModalCreateSegmentDetail).missionControlBalance?.accountIdentifier
	);

	interface Props {
		detail: JunoModalDetail;
		priceLabel: string;
		insufficientFunds?: boolean;
		children?: import('svelte').Snippet;
	}

	let { detail, priceLabel, insufficientFunds = $bindable(true), children }: Props = $props();

	let notEnoughCredits = $state(false);

	const dispatch = createEventDispatcher();
	run(() => {
		fee = (detail as JunoModalCreateSegmentDetail).fee;
	});
	run(() => {
		balance = (detail as JunoModalCreateSegmentDetail).missionControlBalance?.balance ?? 0n;
	});
	run(() => {
		credits = (detail as JunoModalCreateSegmentDetail).missionControlBalance?.credits ?? 0n;
	});

	run(() => {
		notEnoughCredits = credits * fee < fee * E8S_PER_ICP;
	});
	run(() => {
		insufficientFunds = balance < fee && notEnoughCredits;
	});
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
	{@render children?.()}
{/if}
