<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import type { MemorySize } from '$declarations/satellite/satellite.did';
	import Canister from '$lib/components/canister/Canister.svelte';
	import CanisterValue from '$lib/components/canister/CanisterValue.svelte';
	import SnapshotsMemory from '$lib/components/snapshot/SnapshotsMemory.svelte';
	import InlineWarning from '$lib/components/ui/InlineWarning.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData, CanisterSyncStatus, Segment } from '$lib/types/canister';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { formatBytes, formatNumber } from '$lib/utils/number.utils';

	interface Props {
		canisterId: Principal;
		segment: Segment;
		heapWarningLabel?: string | undefined;
	}

	let { canisterId, segment, heapWarningLabel = undefined }: Props = $props();

	let data: CanisterData | undefined = $state();
	let sync: CanisterSyncStatus | undefined = $state();

	let idleCyclesBurnedPerDay: bigint | undefined = $derived(data?.canister?.idleCyclesBurnedPerDay);

	let numInstructionsTotal: bigint | undefined = $derived(
		data?.canister?.queryStats?.numInstructionsTotal
	);

	let numCallsTotal: bigint | undefined = $derived(data?.canister?.queryStats?.numCallsTotal);

	let responsePayloadBytesTotal: bigint | undefined = $derived(
		data?.canister?.queryStats?.responsePayloadBytesTotal
	);

	let requestPayloadBytesTotal: bigint | undefined = $derived(
		data?.canister?.queryStats?.requestPayloadBytesTotal
	);

	let memory: MemorySize | undefined = $derived(data?.memory);

	let warning: boolean = $derived(data?.warning?.heap === true);
</script>

<div>
	<div class="status">
		<Value>
			{#snippet label()}
				{$i18n.core.status}
			{/snippet}
			<Canister {canisterId} bind:data bind:sync />
		</Value>
	</div>

	{#if ['satellite', 'orbiter'].includes(segment)}
		<CanisterValue {sync} rows={2}>
			{#snippet label()}
				{$i18n.canisters.memory}
			{/snippet}
			<p>
				{nonNullish(memory) ? formatBytes(Number(memory.heap)) : '???'}
				<small
					>{$i18n.canisters.on_heap}
					{#if warning}<InlineWarning title={heapWarningLabel} />{/if}</small
				>
			</p>
			<p>
				{nonNullish(memory) ? formatBytes(Number(memory.stable)) : '???'}
				<small>{$i18n.canisters.on_stable}</small>
			</p>
			<SnapshotsMemory {canisterId} />
		</CanisterValue>
	{/if}
</div>

<div>
	<div class="queries">
		<CanisterValue {sync} rows={4}>
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
				{nonNullish(requestPayloadBytesTotal)
					? formatBytes(Number(requestPayloadBytesTotal))
					: '???'}
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

	<div class="consumption">
		<CanisterValue {sync}>
			{#snippet label()}
				{$i18n.canisters.daily_consumption}
			{/snippet}
			<p>
				{formatTCycles(idleCyclesBurnedPerDay ?? 0n)}T <small>cycles</small>
			</p>
		</CanisterValue>
	</div>
</div>

<style lang="scss">
	p {
		max-width: 300px;
		color: var(--value-color);

		&:not(:last-of-type) {
			margin: 0 0 var(--padding-0_25x);
		}
	}

	.status {
		min-height: calc(100px + var(--padding-2_5x));
		min-width: 170px;
	}

	.queries {
		min-height: calc(126px + var(--padding-2_5x));
	}

	.consumption {
		min-height: calc(48px + var(--padding-2_5x));
	}
</style>
