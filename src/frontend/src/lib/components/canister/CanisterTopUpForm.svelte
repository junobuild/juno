<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { onMount, type Snippet } from 'svelte';
	import { icpXdrConversionRate } from '$lib/api/cmc.api';
	import InputIcp from '$lib/components/core/InputIcp.svelte';
	import MissionControlICPInfo from '$lib/components/mission-control/MissionControlICPInfo.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { TOP_UP_NETWORK_FEES } from '$lib/constants/constants';
	import { icpToUsd } from '$lib/derived/exchange.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Segment } from '$lib/types/canister';
	import { formatTCycles, icpToCycles } from '$lib/utils/cycles.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatICPToHTML } from '$lib/utils/icp.utils';

	interface Props {
		intro?: Snippet;
		segment: Segment;
		balance: bigint;
		accountIdentifier: AccountIdentifier | undefined;
		icp: string | undefined;
		invalidCycles: boolean;
		onsubmit: ($event: SubmitEvent) => Promise<void>;
	}

	let {
		accountIdentifier,
		onsubmit,
		intro,
		segment,
		balance,
		icp = $bindable(),
		invalidCycles = $bindable(false)
	}: Props = $props();

	let trillionRatio: bigint | undefined = $state();
	onMount(async () => (trillionRatio = await icpXdrConversionRate()));

	let cycles: number | undefined = $derived(
		nonNullish(trillionRatio) && !isNaN(Number(icp)) && nonNullish(icp)
			? icpToCycles({ icp: Number(icp), trillionRatio })
			: undefined
	);

	let validCycles = $derived(nonNullish(cycles));

	$effect(() => {
		invalidCycles = !validCycles;
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
		<InputIcp bind:amount={icp} {balance} />

		<div class="cycles">
			<Value>
				{#snippet label()}
					{$i18n.canisters.converted_cycles}
				{/snippet}
				{nonNullish(cycles) ? `${formatTCycles(BigInt(cycles ?? 0))}` : '0'} TCycles
			</Value>
		</div>

		<button type="submit" disabled={isNullish($missionControlIdDerived) || invalidCycles}
			>{$i18n.canisters.top_up}</button
		>
	</form>
{/if}

<style lang="scss">
	@use '../../styles/mixins/media';
	@use '../../styles/mixins/grid';

	form {
		@include media.min-width(large) {
			@include grid.two-columns;
		}
	}

	p {
		min-height: 24px;
	}

	.cycles,
	button {
		grid-column-start: 1;
	}

	button {
		margin: var(--padding-2x) 0 0;
	}
</style>
