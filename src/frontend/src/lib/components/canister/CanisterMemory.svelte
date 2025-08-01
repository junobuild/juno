<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import CanisterMemoryChart from '$lib/components/canister/CanisterMemoryChart.svelte';
	import CanisterValue from '$lib/components/canister/CanisterValue.svelte';
	import InlineWarning from '$lib/components/ui/InlineWarning.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type {
		CanisterData,
		CanisterDataInfo,
		CanisterSyncStatus,
		Segment
	} from '$lib/types/canister';
	import { formatBytes } from '$lib/utils/number.utils.js';

	interface Props {
		canister: CanisterDataInfo | undefined;
		canisterData: CanisterData | undefined;
		sync: CanisterSyncStatus | undefined;
		heapWarningLabel?: string | undefined;
		segment: Segment;
	}

	let { canister, canisterData, sync, heapWarningLabel, segment }: Props = $props();

	let warning = $derived(canisterData?.warning?.heap === true);

	let memorySizeInTotal = $derived(canister?.memorySize);

	let memoryMetrics = $derived(canister?.memoryMetrics);

	let wasmMemorySize = $derived(memoryMetrics?.wasmMemorySize);
	let stableMemorySize = $derived(memoryMetrics?.stableMemorySize);
	let globalMemorySize = $derived(memoryMetrics?.globalMemorySize);
	let wasmBinarySize = $derived(memoryMetrics?.wasmBinarySize);
	let wasmChunkStoreSize = $derived(memoryMetrics?.wasmChunkStoreSize);
	let customSectionsSize = $derived(memoryMetrics?.customSectionsSize);
	let canisterHistorySize = $derived(memoryMetrics?.canisterHistorySize);
	let snapshotsSize = $derived(memoryMetrics?.snapshotsSize);

	const ONE_MB = 1000 * 1000;
	const ONE_KB = 1000;
</script>

<div class="memory">
	<CanisterValue rows={3} {sync}>
		{#snippet label()}
			{$i18n.canisters.memory}
		{/snippet}

		<p class="total">
			{nonNullish(memorySizeInTotal) ? formatBytes(Number(memorySizeInTotal)) : '???'}
			<small>{$i18n.canisters.in_total}</small>
		</p>

		<p>
			{nonNullish(wasmMemorySize) ? formatBytes(Number(wasmMemorySize)) : '???'}
			<small
				>{$i18n.canisters.on_heap}
				{#if warning}<InlineWarning iconSize="16" title={heapWarningLabel} />{/if}</small
			>
		</p>

		<p>
			{nonNullish(stableMemorySize) ? formatBytes(Number(stableMemorySize)) : '???'}
			<small>{$i18n.canisters.on_stable}</small>
		</p>

		{#if (globalMemorySize ?? 0n) > ONE_MB}
			<p>
				{nonNullish(globalMemorySize) ? formatBytes(Number(globalMemorySize)) : '???'}
				<small>{$i18n.canisters.in_global}</small>
			</p>
		{/if}

		{#if ['mission_control'].includes(segment) && (wasmChunkStoreSize ?? 0n) > 0n}
			<p>
				{nonNullish(wasmChunkStoreSize) ? formatBytes(Number(wasmChunkStoreSize)) : '???'}
				<small>{$i18n.canisters.in_chunks}</small>
			</p>
		{/if}

		{#if (snapshotsSize ?? 0n) > 0n}
			<p>
				{nonNullish(snapshotsSize) ? formatBytes(Number(snapshotsSize)) : '???'}
				<small>{$i18n.canisters.on_snapshot}</small>
			</p>
		{/if}

		<p>
			{nonNullish(customSectionsSize) ? formatBytes(Number(customSectionsSize)) : '???'}
			<small>{$i18n.canisters.of_custom_sections}</small>
		</p>

		<p>
			{nonNullish(wasmBinarySize) ? formatBytes(Number(wasmBinarySize)) : '???'}
			<small>{$i18n.canisters.of_code}</small>
		</p>

		{#if (canisterHistorySize ?? 0n) > ONE_KB}
			<p>
				{nonNullish(canisterHistorySize) ? formatBytes(Number(canisterHistorySize)) : '???'}
				<small>{$i18n.canisters.in_history}</small>
			</p>
		{/if}

		<CanisterMemoryChart {canister} {segment} />
	</CanisterValue>
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	.memory {
		min-width: 200px;
		min-height: calc(408px + var(--padding-2_5x));

		@include media.min-width(medium) {
			position: relative;
			min-height: calc(174px + var(--padding-2_5x));
			padding-bottom: 180px;
		}
	}

	p {
		&:not(:last-of-type) {
			margin: 0 0 var(--padding-0_25x);
		}
	}

	.total {
		padding: 0 0 var(--padding-2_5x);
	}
</style>
