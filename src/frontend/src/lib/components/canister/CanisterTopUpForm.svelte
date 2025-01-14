<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { onMount, type Snippet } from 'svelte';
	import { icpXdrConversionRate } from '$lib/api/cmc.api';
	import CanisterTopUpCycles from '$lib/components/canister/CanisterTopUpCycles.svelte';
	import InputIcp from '$lib/components/core/InputIcp.svelte';
	import MissionControlICPInfo from '$lib/components/mission-control/MissionControlICPInfo.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { TOP_UP_NETWORK_FEES } from '$lib/constants/constants';
	import { icpToUsd } from '$lib/derived/exchange.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterSegmentWithLabel } from '$lib/types/canister';
	import { icpToCycles } from '$lib/utils/cycles.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { formatICPToHTML } from '$lib/utils/icp.utils';

	interface Props {
		intro?: Snippet;
		segment: CanisterSegmentWithLabel;
		balance: bigint;
		accountIdentifier: AccountIdentifier | undefined;
		icp: string | undefined;
		cycles: number | undefined;
		onreview: () => void;
		onclose: () => void;
	}

	let {
		accountIdentifier,
		onreview,
		intro,
		segment,
		balance,
		onclose,
		icp = $bindable(undefined),
		cycles = $bindable(undefined)
	}: Props = $props();

	let trillionRatio: bigint | undefined = $state();
	onMount(async () => (trillionRatio = await icpXdrConversionRate()));

	let convertedCycles: number | undefined = $derived(
		nonNullish(trillionRatio) && !isNaN(Number(icp)) && nonNullish(icp)
			? icpToCycles({ icp: Number(icp), trillionRatio })
			: undefined
	);

	$effect(() => {
		cycles = convertedCycles;
	});
</script>

{@render intro?.()}

<p>
	{i18nFormat($i18n.canisters.cycles_description, [
		{
			placeholder: '{0}',
			value: segment.segment.replace('_', ' ')
		}
	])}
	<Html
		text={i18nFormat($i18n.canisters.top_up_info, [
			{
				placeholder: '{0}',
				value: formatICPToHTML({ e8s: balance, bold: false, icpToUsd: $icpToUsd })
			}
		])}
	/>
</p>

{#if balance <= TOP_UP_NETWORK_FEES}
	<MissionControlICPInfo {accountIdentifier} {onclose} />
{:else}
	<form onsubmit={onreview}>
		<InputIcp bind:amount={icp} {balance} />

		<div class="cycles">
			<CanisterTopUpCycles {cycles} />
		</div>

		<button type="submit" disabled={isNullish($missionControlIdDerived) || isNullish(cycles)}
			>{$i18n.core.review}</button
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
</style>
