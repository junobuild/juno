<script lang="ts">
	import MissionControlICPInfo from '$lib/components/mission-control/MissionControlICPInfo.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/i18n.store';
	import { formatE8sICP } from '$lib/utils/icp.utils';
	import { createEventDispatcher } from 'svelte';

	export let balance: bigint;
	export let credits: bigint;
	export let fee: bigint;

	export let insufficientFunds = true;
	$: insufficientFunds = balance + credits < fee;

	let notEnoughCredits = false;
	$: notEnoughCredits = credits < fee;

	const dispatch = createEventDispatcher();
</script>

{#if notEnoughCredits}
	<p>
		{@html i18nFormat($i18n.satellites.create_satellite_price, [
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
