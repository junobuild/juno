<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { onMount, type Snippet } from 'svelte';
	import { icpXdrConversionRate } from '$lib/api/cmc.api';
	import MissionControlICPInfo from '$lib/components/mission-control/MissionControlICPInfo.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { E8S_PER_ICP, TOP_UP_NETWORK_FEES } from '$lib/constants/constants';
	import { icpToUsd } from '$lib/derived/exchange.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Segment } from '$lib/types/canister';
	import { formatTCycles, icpToCycles } from '$lib/utils/cycles.utils.js';
	import { i18nFormat } from '$lib/utils/i18n.utils.js';
	import { formatICPToHTML } from '$lib/utils/icp.utils.js';

	interface Props {
		intro?: Snippet;
		segment: Segment;
		balance: bigint;
		accountIdentifier: AccountIdentifier | undefined;
		icp: number | undefined;
		invalidIcpCycles: boolean;
		onsubmit: ($event: SubmitEvent) => Promise<void>;
	}

	let {
		accountIdentifier,
		onsubmit,
		intro,
		segment,
		balance,
		icp = $bindable(undefined),
		invalidIcpCycles = $bindable(false)
	}: Props = $props();

	let trillionRatio: bigint | undefined = $state();
	onMount(async () => (trillionRatio = await icpXdrConversionRate()));

	let validIcp = $derived(
		nonNullish(icp) &&
			icp > 0 &&
			icp < Number(balance) / Number(E8S_PER_ICP) &&
			icp > Number(TOP_UP_NETWORK_FEES) / Number(E8S_PER_ICP)
	);

	let cycles: number | undefined = $derived(
		nonNullish(trillionRatio) && validIcp && nonNullish(icp)
			? icpToCycles({ icp, trillionRatio })
			: undefined
	);

	let validCycles = $derived(nonNullish(cycles));

	$effect(() => {
		invalidIcpCycles = !validIcp || !validCycles;
	});
</script>

{@render intro?.()}

<p>
	{i18nFormat($i18n.canisters.cycles_description, [
		{
			placeholder: '{0}',
			value: segment
		}
	])}
	<Html
		text={i18nFormat($i18n.canisters.top_up_info, [
			{
				placeholder: '{0}',
				value: formatICPToHTML({ e8s: balance, bold: false, icpToUsd: $icpToUsd })
			},
			{
				placeholder: '{1}',
				value: formatICPToHTML({ e8s: TOP_UP_NETWORK_FEES, bold: false, icpToUsd: $icpToUsd })
			}
		])}
	/>
</p>

{#if balance <= TOP_UP_NETWORK_FEES}
	<MissionControlICPInfo {accountIdentifier} onclose={close} />
{:else}
	<form {onsubmit}>
		<div>
			<Value>
				{#snippet label()}
					ICP
				{/snippet}
				<Input
					name="icp"
					inputType="icp"
					required
					bind:value={icp}
					placeholder={$i18n.canisters.amount}
				/>
			</Value>
		</div>

		<div class="cycles">
			<Value>
				{#snippet label()}
					{$i18n.canisters.converted_cycles}
				{/snippet}
				{nonNullish(cycles) ? `${formatTCycles(BigInt(cycles ?? 0))}` : '0'} TCycles
			</Value>
		</div>

		<button
			type="submit"
			disabled={isNullish($missionControlIdDerived) || !validIcp || !validCycles}
			>{$i18n.canisters.top_up}</button
		>
	</form>
{/if}

<style lang="scss">
	p {
		min-height: 24px;
	}

	.cycles {
		padding: var(--padding) 0 0;
	}
</style>
