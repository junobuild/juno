<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import CanisterValue from '$lib/components/canister/CanisterValue.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterDataInfo, CanisterSyncStatus } from '$lib/types/canister';
	import { formatBytes, formatNumber } from '$lib/utils/number.utils.js';

	interface Props {
		canister: CanisterDataInfo | undefined;
		sync: CanisterSyncStatus | undefined;
	}

	let { canister, sync }: Props = $props();

	let numInstructionsTotal: bigint | undefined = $derived(
		canister?.queryStats.numInstructionsTotal
	);

	let numCallsTotal: bigint | undefined = $derived(canister?.queryStats.numCallsTotal);

	let responsePayloadBytesTotal: bigint | undefined = $derived(
		canister?.queryStats.responsePayloadBytesTotal
	);

	let requestPayloadBytesTotal: bigint | undefined = $derived(
		canister?.queryStats.requestPayloadBytesTotal
	);
</script>

<div class="queries">
	<CanisterValue rows={4} {sync}>
		{#snippet label()}
			{$i18n.canisters.queries}
		{/snippet}

		<p>
			{nonNullish(numCallsTotal)
				? formatNumber(Number(numCallsTotal), {
						minFraction: 0,
						maxFraction: 0,
						notation: 'compact'
					})
				: '???'} <small>{$i18n.canisters.calls}</small>
		</p>
		<p>
			{nonNullish(numInstructionsTotal)
				? formatNumber(Number(numInstructionsTotal), {
						minFraction: 0,
						maxFraction: 0,
						notation: 'compact'
					})
				: '???'}
			<small>{$i18n.canisters.instructions}</small>
		</p>
		<p>
			{nonNullish(requestPayloadBytesTotal) ? formatBytes(Number(requestPayloadBytesTotal)) : '???'}
			<small>{$i18n.canisters.requests}</small>
		</p>
		<p>
			{nonNullish(responsePayloadBytesTotal)
				? formatBytes(Number(responsePayloadBytesTotal))
				: '???'}
			<small>{$i18n.canisters.responses}</small>
		</p>
	</CanisterValue>
</div>

<style lang="scss">
	p {
		&:not(:last-of-type) {
			margin: 0 0 var(--padding-0_25x);
		}
	}
</style>
