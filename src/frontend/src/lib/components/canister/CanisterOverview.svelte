<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { i18n } from '$lib/stores/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';
	import Canister from '$lib/components/canister/Canister.svelte';
	import type { CanisterData, CanisterSyncStatus, Segment } from '$lib/types/canister';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import type { MemorySize } from '$declarations/satellite/satellite.did';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { formatNumber } from '$lib/utils/number.utils';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';

	export let canisterId: Principal;
	export let segment: Segment;
	export let heapWarningLabel: string | undefined = undefined;

	let data: CanisterData | undefined;
	let sync: CanisterSyncStatus | undefined;

	let idleCyclesBurnedPerDay: bigint | undefined;
	$: idleCyclesBurnedPerDay = data?.canister?.idleCyclesBurnedPerDay;

	let numInstructionsTotal: bigint | undefined;
	$: numInstructionsTotal = data?.canister?.queryStats?.numInstructionsTotal;

	let numCallsTotal: bigint | undefined;
	$: numCallsTotal = data?.canister?.queryStats?.numCallsTotal;

	let responsePayloadBytesTotal: bigint | undefined;
	$: responsePayloadBytesTotal = data?.canister?.queryStats?.responsePayloadBytesTotal;

	let requestPayloadBytesTotal: bigint | undefined;
	$: requestPayloadBytesTotal = data?.canister?.queryStats?.requestPayloadBytesTotal;

	let memory: MemorySize | undefined;
	$: memory = data?.memory;

	let warning: boolean;
	$: warning = data?.warning?.heap === true ?? false;
</script>

<div>
	<div class="status">
		<Value>
			<svelte:fragment slot="label">{$i18n.core.status}</svelte:fragment>
			<Canister {canisterId} {segment} bind:data bind:sync />
		</Value>
	</div>

	{#if ['satellite', 'orbiter'].includes(segment)}
		<Value>
			<svelte:fragment slot="label">{$i18n.canisters.memory}</svelte:fragment>
			{#if nonNullish(memory)}
				<p>
					{formatNumber(Number(memory.heap) / 1_000_000)}
					<small
						>MB {$i18n.canisters.on_heap}
						{#if warning}<span class="warning" title={heapWarningLabel}><IconWarning /></span
							>{/if}</small
					>
				</p>
				<p>
					{formatNumber(Number(memory.stable) / 1_000_000)}
					<small>MB {$i18n.canisters.on_stable}</small>
				</p>
			{:else if isNullish(sync) || ['loading', 'syncing'].includes(sync ?? '')}
				<p><SkeletonText /></p>
				<p><SkeletonText /></p>
			{:else if sync !== 'synced'}
				<p>Heap ???</p>
				<p>Stable ???</p>
			{/if}
		</Value>
	{/if}
</div>

<div>
	<div class="queries">
		<Value>
			<svelte:fragment slot="label">{$i18n.canisters.queries}</svelte:fragment>
			{#if ['synced', 'syncing'].includes(sync ?? '')}
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
						? formatNumber(Number(requestPayloadBytesTotal) / 1_000_000, { notation: 'compact' })
						: '???'}
					<small
						>{nonNullish(requestPayloadBytesTotal) ? 'MB ' : ''}{$i18n.canisters.requests}</small
					>
				</p>
				<p>
					{nonNullish(responsePayloadBytesTotal)
						? formatNumber(Number(responsePayloadBytesTotal) / 1_000_000, { notation: 'compact' })
						: '???'}
					<small
						>{nonNullish(responsePayloadBytesTotal) ? 'MB ' : ''}{$i18n.canisters.responses}</small
					>
				</p>
			{:else if sync === 'loading'}
				<p><SkeletonText /></p>
				<p><SkeletonText /></p>
				<p><SkeletonText /></p>
				<p><SkeletonText /></p>
			{/if}
		</Value>
	</div>

	<div class="consumption">
		<Value>
			<svelte:fragment slot="label">{$i18n.canisters.daily_consumption}</svelte:fragment>
			{#if ['synced', 'syncing'].includes(sync ?? '')}
				<p>
					{formatTCycles(idleCyclesBurnedPerDay ?? 0n)} <small>T Cycles</small>
				</p>
			{:else if sync === 'loading'}
				<p><SkeletonText /></p>
			{/if}
		</Value>
	</div>
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

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

	.warning {
		color: #f37010;
	}

	@include media.dark-theme {
		.warning {
			color: var(--color-warning);
		}
	}
</style>
